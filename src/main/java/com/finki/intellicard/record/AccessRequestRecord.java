package com.finki.intellicard.record;

public record AccessRequestRecord(
        Long id,
        Long cardSetId,
        String cardSetName,
        Long requesterId,
        String requesterUsername,
        String status) {
}