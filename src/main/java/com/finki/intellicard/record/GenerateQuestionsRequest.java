package com.finki.intellicard.record;

import lombok.Data;

import java.util.List;

@Data
public class GenerateQuestionsRequest {
    private Integer questionCount;
    private String difficultyLevel;
    private String language;
    private List<String> questionTypes;
    private Boolean includeAnswers;

    public GenerateQuestionsRequest() {}
}