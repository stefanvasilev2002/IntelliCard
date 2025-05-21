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

    @Column(columnDefinition = "integer default 0")
    private Integer timesReviewed;

    @Column(columnDefinition = "integer default 0")
    private Integer timesCorrect;

    @Column(columnDefinition = "integer default 0")
    private Integer consecutiveCorrect;

    @Column(columnDefinition = "double default 2.5")
    private Double easeFactor;

    private LocalDateTime lastReviewed;

    private LocalDateTime nextReviewDate;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(10) default 'NEW'")
    private CardStatus status = CardStatus.NEW;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id", nullable = false)
    @JsonBackReference
    private CardSet cardSet;
}
