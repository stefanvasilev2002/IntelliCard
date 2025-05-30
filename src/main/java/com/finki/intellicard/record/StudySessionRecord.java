package com.finki.intellicard.record;

public record StudySessionRecord(
        Long cardSetId,
        String cardSetName,
        int totalCards,
        int dueCards,
        int masteredCards,
        int learningCards) {
}