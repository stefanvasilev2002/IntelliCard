package com.finki.intellicard.repository;

import com.finki.intellicard.model.UserCardProgress;
import com.finki.intellicard.model.enums.CardStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserCardProgressRepository extends JpaRepository<UserCardProgress, Long> {

    Optional<UserCardProgress> findByUserIdAndCardId(Long userId, Long cardId);

    List<UserCardProgress> findByUserIdAndCard_CardSet_Id(Long userId, Long cardSetId);

    @Query("SELECT ucp FROM UserCardProgress ucp WHERE ucp.user.id = :userId AND ucp.card.cardSet.id = :cardSetId AND ucp.nextReviewDate <= :now")
    List<UserCardProgress> findDueCardsForUser(@Param("userId") Long userId, @Param("cardSetId") Long cardSetId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(ucp) FROM UserCardProgress ucp WHERE ucp.user.id = :userId AND ucp.card.cardSet.id = :cardSetId AND ucp.nextReviewDate <= :now")
    int countDueCardsForUser(@Param("userId") Long userId, @Param("cardSetId") Long cardSetId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(ucp) FROM UserCardProgress ucp WHERE ucp.user.id = :userId AND ucp.card.cardSet.id = :cardSetId AND ucp.status = :status")
    int countCardsByStatusForUser(@Param("userId") Long userId, @Param("cardSetId") Long cardSetId, @Param("status") CardStatus status);

    @Query("SELECT COUNT(c) FROM Card c WHERE c.cardSet.id = :cardSetId")
    int countTotalCardsInSet(@Param("cardSetId") Long cardSetId);

    @Modifying
    @Query("DELETE FROM UserCardProgress ucp WHERE ucp.card.id = :cardId")
    void deleteByCardId(@Param("cardId") Long cardId);}