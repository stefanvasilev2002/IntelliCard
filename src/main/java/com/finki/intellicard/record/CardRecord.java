package com.finki.intellicard.record;

import java.time.LocalDateTime;

public record CardRecord(
        Long id,
        String term,
        String definition,
        Integer timesReviewed,
        Integer timesCorrect,
        LocalDateTime nextReviewDate,
        String status) {
}