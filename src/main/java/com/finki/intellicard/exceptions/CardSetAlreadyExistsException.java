package com.finki.intellicard.exceptions;

public class CardSetAlreadyExistsException extends RuntimeException {
    public CardSetAlreadyExistsException(String message) {
        super(message);
    }
}
