package com.finki.intellicard.service;

import com.finki.intellicard.model.Card;
import com.finki.intellicard.model.CardSet;
import com.finki.intellicard.model.enums.CardStatus;
import com.finki.intellicard.record.CardRecord;
import com.finki.intellicard.repository.CardRepository;
import com.finki.intellicard.repository.CardSetRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final CardSetRepository cardSetRepository;

    public CardService(CardRepository cardRepository, CardSetRepository cardSetRepository) {
        this.cardRepository = cardRepository;
        this.cardSetRepository = cardSetRepository;
    }

    public List<CardRecord> getAllCardsByCardSetId(Long cardSetId) {
        return cardRepository.findByCardSetId(cardSetId).stream()
                .map(this::convertToRecord)
                .collect(Collectors.toList());
    }

    public CardRecord addCard(Long cardSetId, CardRecord cardRecord) {
        CardSet cardSet = cardSetRepository.findById(cardSetId)
                .orElseThrow(() -> new RuntimeException("CardSet not found"));

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

    public CardRecord updateCard(Long cardId, CardRecord cardRecord) {
        Optional<Card> optionalCard = cardRepository.findById(cardId);
        if (optionalCard.isPresent()) {
            Card card = optionalCard.get();
            card.setTerm(cardRecord.term());
            card.setDefinition(cardRecord.definition());
            Card updatedCard = cardRepository.save(card);
            return convertToRecord(updatedCard);
        } else {
            throw new RuntimeException("Card not found with id: " + cardId);
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