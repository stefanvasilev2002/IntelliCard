package com.finki.intellicard.model;

import com.finki.intellicard.model.enums.CardStatus;
import jakarta.persistence.*;
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
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "card_id"}))
public class UserCardProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

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

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}