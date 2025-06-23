package com.finki.intellicard.service;

import com.finki.intellicard.exceptions.CardNotFoundException;
import com.finki.intellicard.exceptions.CardSetNotFoundException;
import com.finki.intellicard.exceptions.UnauthorizedAccessException;
import com.finki.intellicard.model.Card;
import com.finki.intellicard.model.CardSet;
import com.finki.intellicard.model.UserCardProgress;
import com.finki.intellicard.record.CardRecord;
import com.finki.intellicard.record.Document;
import com.finki.intellicard.record.GenerateQuestionsRequest;
import com.finki.intellicard.record.GeneratedCardDto;
import com.finki.intellicard.repository.CardRepository;
import com.finki.intellicard.repository.CardSetRepository;
import com.finki.intellicard.repository.UserCardProgressRepository;
import jakarta.transaction.Transactional;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final CardSetRepository cardSetRepository;
    private final MyUserDetailsService myUserDetailsService;
    private final UserCardProgressRepository userCardProgressRepository;
    private final QuestionGenerationService questionGenerationService;

    public CardService(CardRepository cardRepository, CardSetRepository cardSetRepository, MyUserDetailsService myUserDetailsService, UserCardProgressRepository userCardProgressRepository, QuestionGenerationService questionGenerationService) {
        this.cardRepository = cardRepository;
        this.cardSetRepository = cardSetRepository;
        this.myUserDetailsService = myUserDetailsService;
        this.userCardProgressRepository = userCardProgressRepository;
        this.questionGenerationService = questionGenerationService;
    }

    public List<CardRecord> getAllCardsByCardSetId(Long cardSetId) {
        CardSet cardSet = cardSetRepository.findById(cardSetId)
                .orElseThrow(() -> new CardSetNotFoundException("CardSet not found"));

        verifyCardSetAccess(cardSet);

        Long currentUserId = myUserDetailsService.getUserIdByUsername(myUserDetailsService.getUsername());
        List<Card> cards = cardRepository.findByCardSetId(cardSetId);

        return cards.stream()
                .map(card -> {
                    Optional<UserCardProgress> progress = userCardProgressRepository
                            .findByUserIdAndCardId(currentUserId, card.getId());
                    return convertToRecord(card, progress.orElse(null));
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public CardRecord addCard(Long cardSetId, CardRecord cardRecord) {
        CardSet cardSet = cardSetRepository.findById(cardSetId)
                .orElseThrow(() -> new CardSetNotFoundException("CardSet not found"));

        verifyCardSetOwnership(cardSet);

        Card card = Card.builder()
                .term(cardRecord.term())
                .definition(cardRecord.definition())
                .cardSet(cardSet)
                .build();

        Card savedCard = cardRepository.save(card);
        return new CardRecord(
                card.getId(),
                card.getTerm(),
                card.getDefinition(),
                0,
                0,
                LocalDateTime.now().plusDays(1),
                "NEW"
        );
    }

    @Transactional
    public CardRecord updateCard(Long cardId, CardRecord cardRecord) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new CardNotFoundException("Card not found with id: " + cardId));

        verifyCardSetOwnership(card.getCardSet());

        card.setTerm(cardRecord.term());
        card.setDefinition(cardRecord.definition());
        Card updatedCard = cardRepository.save(card);

        Long currentUserId = myUserDetailsService.getUserIdByUsername(myUserDetailsService.getUsername());
        Optional<UserCardProgress> progress = userCardProgressRepository
                .findByUserIdAndCardId(currentUserId, updatedCard.getId());

        return convertToRecord(updatedCard, progress.orElse(null));
    }

    @Transactional
    public void deleteCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new CardNotFoundException("Card not found with id: " + cardId));

        verifyCardSetOwnership(card.getCardSet());

        userCardProgressRepository.deleteByCardId(cardId);

        cardRepository.delete(card);
    }

    private void verifyCardSetOwnership(CardSet cardSet) {
        String currentUsername = myUserDetailsService.getUsername();
        if (!cardSet.getCreator().getUsername().equals(currentUsername)) {
            throw new UnauthorizedAccessException("You are not authorized to perform this action on this card set");
        }
    }

    private void verifyCardSetAccess(CardSet cardSet) {
        String currentUsername = myUserDetailsService.getUsername();
        Long currentUserId = myUserDetailsService.getUserIdByUsername(currentUsername);

        boolean hasAccess = cardSet.getCreator().getId().equals(currentUserId) ||
                cardSet.isPublic() ||
                cardSet.getApprovedUsers().stream().anyMatch(user -> user.getId().equals(currentUserId));

        if (!hasAccess) {
            throw new UnauthorizedAccessException("You are not authorized to access this card set");
        }
    }

    private CardRecord convertToRecord(Card card, UserCardProgress progress) {
        return new CardRecord(
                card.getId(),
                card.getTerm(),
                card.getDefinition(),
                progress != null ? progress.getTimesReviewed() : 0,
                progress != null ? progress.getTimesCorrect() : 0,
                progress != null ? progress.getNextReviewDate() : null,
                progress != null ? progress.getStatus().toString() : "NEW"
        );
    }

    @Transactional
    public List<CardRecord> generateCardsFromDocument(
            Long cardSetId,
            MultipartFile file,
            Integer questionCount,
            String difficultyLevel,
            String language) {

        CardSet cardSet = cardSetRepository.findById(cardSetId)
                .orElseThrow(() -> new CardSetNotFoundException("CardSet not found"));
        verifyCardSetOwnership(cardSet);

        String documentText = extractTextFromDocument(file);

        if (documentText == null || documentText.trim().length() < 100) {
            throw new IllegalArgumentException("Document appears to be empty or too short. Minimum 100 characters required.");
        }

        List<GeneratedCardDto> generatedCards = generateCardsWithAI(
                documentText, questionCount, difficultyLevel, language);

        if (generatedCards.isEmpty()) {
            throw new RuntimeException("No cards could be generated from the document content");
        }

        List<CardRecord> savedCards = new ArrayList<>();
        for (GeneratedCardDto generatedCard : generatedCards) {
            try {
                if (generatedCard.getTerm() == null || generatedCard.getTerm().trim().isEmpty() ||
                        generatedCard.getDefinition() == null || generatedCard.getDefinition().trim().isEmpty()) {
                    continue;
                }

                Card card = Card.builder()
                        .term(generatedCard.getTerm().trim())
                        .definition(generatedCard.getDefinition().trim())
                        .cardSet(cardSet)
                        .build();

                Card savedCard = cardRepository.save(card);
                savedCards.add(new CardRecord(
                        card.getId(),
                        card.getTerm(),
                        card.getDefinition(),
                        0,
                        0,
                        LocalDateTime.now().plusDays(1),
                        "NEW"
                ));

            } catch (Exception e) {
            }
        }

        return savedCards;
    }

    private String extractTextFromDocument(MultipartFile file) {
        try {
            String filename = file.getOriginalFilename();
            if (filename == null) {
                throw new IllegalArgumentException("File name is required");
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                throw new IllegalArgumentException("File size exceeds 10MB limit");
            }

            String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();

            switch (extension) {
                case "txt":
                    return new String(file.getBytes(), StandardCharsets.UTF_8);
                case "pdf":
                    return extractTextFromPdf(file);
                default:
                    throw new IllegalArgumentException("Unsupported file format: " + extension + ". Supported formats: PDF, TXT");
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + e.getMessage(), e);
        }
    }

    private String extractTextFromPdf(MultipartFile file) {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            if (text == null || text.trim().isEmpty()) {
                throw new RuntimeException("PDF appears to be empty or contains no extractable text");
            }

            return text;
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from PDF: " + e.getMessage(), e);
        }
    }

    private List<GeneratedCardDto> generateCardsWithAI(
            String documentText,
            Integer questionCount,
            String difficultyLevel,
            String language) {

        try {
            Document document = new Document();
            document.setContent(documentText);
            document.setTitle("Uploaded Document");
            document.setLanguage(language);

            GenerateQuestionsRequest request = new GenerateQuestionsRequest();
            request.setQuestionCount(questionCount);
            request.setDifficultyLevel(difficultyLevel);
            request.setLanguage(language);
            request.setQuestionTypes(List.of("FLASHCARD"));
            request.setIncludeAnswers(true);

            List<GeneratedCardDto> cards = questionGenerationService.generateCardsFromDocument(document, request);

            if (cards == null || cards.isEmpty()) {
                throw new RuntimeException("AI service returned no cards");
            }

            return cards;

        } catch (Exception e) {
            throw new RuntimeException("AI card generation failed: " + e.getMessage(), e);
        }
    }
}