package com.finki.intellicard.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.finki.intellicard.model.enums.CardStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String term;

    @NotBlank
    private String definition;

    @Builder.Default
    private Integer timesReviewed = 0;

    @Builder.Default
    private Integer timesCorrect = 0;

    @Builder.Default
    private Integer consecutiveCorrect = 0;

    @Builder.Default
    private Double easeFactor = 2.5;

    private LocalDateTime lastReviewed;

    private LocalDateTime nextReviewDate;

    @Builder.Default
    private Integer interval = 1;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CardStatus status = CardStatus.NEW;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id", nullable = false)
    @JsonBackReference
    private CardSet cardSet;
}