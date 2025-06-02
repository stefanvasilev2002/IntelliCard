package com.finki.intellicard.record;

import lombok.Data;

@Data
public class Document {
    private String content;
    private String title;
    private String format;
    private String language;

    public Document() {}

    public Document(String content, String title) {
        this.content = content;
        this.title = title;
    }
}