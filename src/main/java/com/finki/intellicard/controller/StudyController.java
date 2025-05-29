package com.finki.intellicard.controller;

import com.finki.intellicard.record.CardRecord;
import com.finki.intellicard.record.StudySessionRecord;
import com.finki.intellicard.service.SpacedRepetitionService;
import com.finki.intellicard.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/study")
@Tag(name = "Study", description = "Endpoints for studying flashcards")
public class StudyController {

    private final SpacedRepetitionService spacedRepetitionService;
    private final CardService cardService;

    public StudyController(SpacedRepetitionService spacedRepetitionService, CardService cardService) {
        this.spacedRepetitionService = spacedRepetitionService;
        this.cardService = cardService;
    }

    @Operation(summary = "Get due cards for review",
            description = "Get all cards that are due for review in a card set")
    @GetMapping("/cardset/{cardSetId}/due")
    public ResponseEntity<List<CardRecord>> getDueCards(
            @Parameter(description = "ID of the card set")
            @PathVariable Long cardSetId) {
        List<CardRecord> dueCards = spacedRepetitionService.getDueCardsForReview(cardSetId);
        return ResponseEntity.ok(dueCards);
    }

    @Operation(summary = "Review a card",
            description = "Submit review result for a card (affects spaced repetition algorithm)")
    @PostMapping("/card/{cardId}/review")
    public ResponseEntity<Void> reviewCard(
            @Parameter(description = "ID of the card")
            @PathVariable Long cardId,
            @Parameter(description = "Whether the answer was correct")
            @RequestParam boolean correct,
            @Parameter(description = "Difficulty rating (1=easy, 5=hard)")
            @RequestParam int difficulty) {
        spacedRepetitionService.reviewCard(cardId, correct, difficulty);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get study session overview",
            description = "Get overview of cards in different learning states")
    @GetMapping("/cardset/{cardSetId}/overview")
    public ResponseEntity<StudySessionRecord> getStudyOverview(
            @Parameter(description = "ID of the card set")
            @PathVariable Long cardSetId) {
        StudySessionRecord overview = spacedRepetitionService.getStudyOverview(cardSetId);
        return ResponseEntity.ok(overview);
    }
}