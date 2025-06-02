package com.finki.intellicard.record;

public record GeneratedCardDto(String term, String definition) {
    public String getTerm() {
        return term;
    }

    public String getDefinition() {
        return definition;
    }
}