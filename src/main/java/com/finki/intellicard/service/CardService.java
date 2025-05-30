package com.finki.intellicard.service;

import com.finki.intellicard.exceptions.CardNotFoundException;
import com.finki.intellicard.exceptions.CardSetNotFoundException;
import com.finki.intellicard.exceptions.UnauthorizedAccessException;
import com.finki.intellicard.model.Card;
import com.finki.intellicard.model.CardSet;
import com.finki.intellicard.model.enums.CardStatus;
import com.finki.intellicard.record.CardRecord;
import com.finki.intellicard.repository.CardRepository;
import com.finki.intellicard.repository.CardSetRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final CardSetRepository cardSetRepository;
    private final MyUserDetailsService myUserDetailsService;

    public CardService(CardRepository cardRepository, CardSetRepository cardSetRepository, MyUserDetailsService myUserDetailsService) {
        this.cardRepository = cardRepository;
        this.cardSetRepository = cardSetRepository;
        this.myUserDetailsService = myUserDetailsService;
    }

    public List<CardRecord> getAllCardsByCardSetId(Long cardSetId) {
        CardSet cardSet = cardSetRepository.findById(cardSetId)
                .orElseThrow(() -> new CardSetNotFoundException("CardSet not found"));

        verifyCardSetAccess(cardSet);

        return cardRepository.findByCardSetId(cardSetId).stream()
                .map(this::convertToRecord)
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
                .timesReviewed(0)
                .timesCorrect(0)
                .consecutiveCorrect(0)
                .easeFactor(2.5)
                .status(CardStatus.NEW)
                .build();

        Card savedCard = cardRepository.save(card);
        return convertToRecord(savedCard);
    }

    @Transactional
    public CardRecord updateCard(Long cardId, CardRecord cardRecord) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new CardNotFoundException("Card not found with id: " + cardId));

        verifyCardSetOwnership(card.getCardSet());

        card.setTerm(cardRecord.term());
        card.setDefinition(cardRecord.definition());
        Card updatedCard = cardRepository.save(card);
        return convertToRecord(updatedCard);
    }

    @Transactional
    public void deleteCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new CardNotFoundException("Card not found with id: " + cardId));

        verifyCardSetOwnership(card.getCardSet());

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