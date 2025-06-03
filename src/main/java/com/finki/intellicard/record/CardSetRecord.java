package com.finki.intellicard.record;

public record CardSetRecord(
        Long id,
        String name,
        Boolean isPublic,
        Long creatorId,
        String creatorName,
        String accessType,
        Integer totalCards) {
}