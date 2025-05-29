package com.finki.intellicard.controller;

import com.finki.intellicard.record.CardRecord;
import com.finki.intellicard.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cards")
@Tag(name = "Cards", description = "Endpoints for managing flashcards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @Operation(summary = "Get all cards in a card set",
            description = "Retrieve all flashcards from a specific card set")
    @GetMapping("/cardset/{cardSetId}")
    public ResponseEntity<List<CardRecord>> getAllCardsByCardSetId(
            @Parameter(description = "ID of the card set")
            @PathVariable Long cardSetId) {
        List<CardRecord> cards = cardService.getAllCardsByCardSetId(cardSetId);
        return ResponseEntity.ok(cards);
    }

    @Operation(summary = "Create a new card",
            description = "Add a new flashcard to a card set")
    @PostMapping("/cardset/{cardSetId}")
    public ResponseEntity<CardRecord> createCard(
            @Parameter(description = "ID of the card set")
            @PathVariable Long cardSetId,
            @RequestBody CardRecord cardRecord) {
        CardRecord newCard = cardService.addCard(cardSetId, cardRecord);
        return ResponseEntity.status(HttpStatus.CREATED).body(newCard);
    }

    @Operation(summary = "Update a card",
            description = "Update an existing flashcard")
    @PutMapping("/{cardId}")
    public ResponseEntity<CardRecord> updateCard(
            @Parameter(description = "ID of the card to update")
            @PathVariable Long cardId,
            @RequestBody CardRecord cardRecord) {
        CardRecord updatedCard = cardService.updateCard(cardId, cardRecord);
        return ResponseEntity.ok(updatedCard);
    }

    @Operation(summary = "Delete a card",
            description = "Remove a flashcard from the system")
    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteCard(
            @Parameter(description = "ID of the card to delete")
            @PathVariable Long cardId) {
        cardService.deleteCard(cardId);
        return ResponseEntity.noContent().build();
    }
}