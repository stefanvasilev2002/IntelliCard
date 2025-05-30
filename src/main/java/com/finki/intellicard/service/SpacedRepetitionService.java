package com.finki.intellicard.service;

import com.finki.intellicard.exceptions.CardNotFoundException;
import com.finki.intellicard.exceptions.CardSetAlreadyExistsException;
import com.finki.intellicard.exceptions.CardSetNotFoundException;
import com.finki.intellicard.exceptions.UnauthorizedAccessException;
import com.finki.intellicard.model.Card;
import com.finki.intellicard.model.CardSet;
import com.finki.intellicard.model.enums.CardStatus;
import com.finki.intellicard.record.CardRecord;
import com.finki.intellicard.record.StudySessionRecord;
import com.finki.intellicard.repository.CardRepository;
import com.finki.intellicard.repository.CardSetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpacedRepetitionService {

    private final CardRepository cardRepository;
    private final CardSetRepository cardSetRepository;
    private final MyUserDetailsService myUserDetailsService;

    public SpacedRepetitionService(CardRepository cardRepository,
                                   CardSetRepository cardSetRepository,
                                   MyUserDetailsService myUserDetailsService) {
        this.cardRepository = cardRepository;
        this.cardSetRepository = cardSetRepository;
        this.myUserDetailsService = myUserDetailsService;
    }

    @Transactional
    public void reviewCard(Long cardId, boolean correct, int difficulty) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new CardNotFoundException("Card not found"));

        verifyCardSetAccess(card.getCardSet());

        updateCardProgress(card, correct, difficulty);
        cardRepository.save(card);
    }

    public List<CardRecord> getDueCardsForReview(Long cardSetId) {
        CardSet cardSet = cardSetRepository.findById(cardSetId)
                .orElseThrow(() -> new CardSetNotFoundException("CardSet not found"));

        verifyCardSetAccess(cardSet);

        return cardRepository.findByCardSetIdAndNextReviewDateBefore(cardSetId, LocalDateTime.now())
                .stream()
                .map(this::convertToRecord)
                .collect(Collectors.toList());
    }

    public StudySessionRecord getStudyOverview(Long cardSetId) {
        CardSet cardSet = cardSetRepository.findById(cardSetId)
                .orElseThrow(() -> new CardSetNotFoundException("CardSet not found"));

        verifyCardSetAccess(cardSet);

        int totalCards = cardRepository.findByCardSetId(cardSetId).size();
        int dueCards = cardRepository.countDueCardsByCardSetId(cardSetId, LocalDateTime.now());
        int masteredCards = cardRepository.countCardsByCardSetIdAndStatus(cardSetId, CardStatus.MASTERED);
        int learningCards = cardRepository.countCardsByCardSetIdAndStatus(cardSetId, CardStatus.LEARNING);

        return new StudySessionRecord(
                cardSetId,
                cardSet.getName(),
                totalCards,
                dueCards,
                masteredCards,
                learningCards
        );
    }

    private void updateCardProgress(Card card, boolean correct, int difficulty) {
        card.setTimesReviewed(card.getTimesReviewed() + 1);
        card.setLastReviewed(LocalDateTime.now());

        if (correct) {
            card.setTimesCorrect(card.getTimesCorrect() + 1);
            card.setConsecutiveCorrect(card.getConsecutiveCorrect() + 1);

            double easeFactor = Math.max(1.3, card.getEaseFactor() + (0.1 - (5 - difficulty) * (0.08 + (5 - difficulty) * 0.02)));
            card.setEaseFactor(easeFactor);

            if (card.getConsecutiveCorrect() == 1) {
                card.setInterval(1);
            } else if (card.getConsecutiveCorrect() == 2) {
                card.setInterval(6);
            } else {
                card.setInterval((int) Math.round(card.getInterval() * easeFactor));
            }

            card.setNextReviewDate(LocalDateTime.now().plusDays(card.getInterval()));

            if (card.getConsecutiveCorrect() >= 5) {
                card.setStatus(CardStatus.MASTERED);
            } else if (card.getConsecutiveCorrect() >= 2) {
                card.setStatus(CardStatus.REVIEW);
            } else {
                card.setStatus(CardStatus.LEARNING);
            }
        } else {
            card.setConsecutiveCorrect(0);
            card.setInterval(1);
            card.setNextReviewDate(LocalDateTime.now().plusDays(1));
            card.setStatus(CardStatus.LEARNING);
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

    private CardRecord convertToRecord(Card card) {
        return new CardRecord(
                card.getId(),
                card.getTerm(),
                card.getDefinition(),
                card.getTimesReviewed(),
                card.getTimesCorrect(),
                card.getNextReviewDate(),
                card.getStatus() != null ? card.getStatus().toString() : "NEW"
        );
    }
}