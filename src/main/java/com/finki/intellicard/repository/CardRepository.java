package com.finki.intellicard.repository;

import com.finki.intellicard.model.Card;
import com.finki.intellicard.model.enums.CardStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByCardSetId(Long cardSetId);
    List<Card> findByCardSetIdAndNextReviewDateBefore(Long cardSetId, LocalDateTime date);
    List<Card> findByCardSetIdAndStatus(Long cardSetId, CardStatus status);


    @Query("SELECT COUNT(c) FROM Card c WHERE c.cardSet.id = :cardSetId AND c.nextReviewDate <= :now")
    int countDueCardsByCardSetId(@Param("cardSetId") Long cardSetId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(c) FROM Card c WHERE c.cardSet.id = :cardSetId AND c.status = :status")
    int countCardsByCardSetIdAndStatus(@Param("cardSetId") Long cardSetId, @Param("status") CardStatus status);

}