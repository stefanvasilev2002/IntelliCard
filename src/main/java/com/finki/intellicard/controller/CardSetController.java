package com.finki.intellicard.controller;

import com.finki.intellicard.record.CardSetRecord;
import com.finki.intellicard.service.CardSetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cardsets")
@Tag(name = "Card Sets", description = "Endpoints for managing card sets")
public class CardSetController {

    private final CardSetService cardSetService;

    public CardSetController(CardSetService cardSetService) {
        this.cardSetService = cardSetService;
    }

    @Operation(summary = "Get all accessible card sets",
            description = "Retrieve all card sets that the current user can access")
    @GetMapping
    public ResponseEntity<List<CardSetRecord>> getAllCardSets() {
        List<CardSetRecord> allCardSets = cardSetService.getAllCardSets();
        return ResponseEntity.ok(allCardSets);
    }

    @Operation(summary = "Create a new card set",
            description = "Create a new flashcard set")
    @PostMapping
    public ResponseEntity<CardSetRecord> createCardSet(@RequestBody CardSetRecord cardSetRecord) {
        CardSetRecord createdCardSet = cardSetService.createCardSet(cardSetRecord);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCardSet);
    }

    @Operation(summary = "Get card set by ID",
            description = "Retrieve a specific card set by its ID")
    @GetMapping("/{cardSetId}")
    public ResponseEntity<CardSetRecord> getCardSetById(
            @Parameter(description = "ID of the card set")
            @PathVariable Long cardSetId) {
        CardSetRecord cardSet = cardSetService.getCardSetById(cardSetId);
        return ResponseEntity.ok(cardSet);
    }

    @Operation(summary = "Update a card set",
            description = "Update an existing card set (owner only)")
    @PutMapping("/{cardSetId}")
    public ResponseEntity<CardSetRecord> updateCardSet(
            @Parameter(description = "ID of the card set to update")
            @PathVariable Long cardSetId,
            @RequestBody CardSetRecord cardSetRecord) {
        CardSetRecord updatedCardSet = cardSetService.updateCardSet(cardSetId, cardSetRecord);
        return ResponseEntity.ok(updatedCardSet);
    }

    @Operation(summary = "Delete a card set",
            description = "Delete a card set (owner only)")
    @DeleteMapping("/{cardSetId}")
    public ResponseEntity<Void> deleteCardSet(
            @Parameter(description = "ID of the card set to delete")
            @PathVariable Long cardSetId) {
        cardSetService.deleteCardSet(cardSetId);
        return ResponseEntity.noContent().build();
    }
}