package com.finki.intellicard.repository;

import com.finki.intellicard.record.CardSetRecord;
import com.finki.intellicard.model.CardSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CardSetRepository extends JpaRepository<CardSet, Long> {

    @Query("SELECT new com.finki.intellicard.record.CardSetRecord(" +
            "c.id, c.name, c.isPublic, " +
            "c.creator.id, c.creator.username, " +
            "CASE " +
            "   WHEN c.creator.id = :currentUserId THEN 'OWNER' " +
            "   WHEN :currentUserId IN (SELECT u.id FROM c.approvedUsers u) THEN 'ACCESSIBLE' " +
            "   WHEN c.isPublic = true THEN 'PUBLIC' " +
            "   WHEN EXISTS (SELECT 1 FROM AccessRequest ar WHERE ar.cardSet.id = c.id " +
            "                AND ar.requester.id = :currentUserId AND ar.status = 'PENDING') THEN 'PENDING' " +
            "   WHEN EXISTS (SELECT 1 FROM AccessRequest ar WHERE ar.cardSet.id = c.id " +
            "                AND ar.requester.id = :currentUserId AND ar.status = 'REJECTED') THEN 'REJECTED' " +
            "   ELSE 'PRIVATE' " +
            "END, " +
            "SIZE(c.cards)) " +
            "FROM CardSet c")
    List<CardSetRecord> findAllPublicAndAccessibleCardsets(@Param("currentUserId") Long currentUserId);

    @Query("SELECT c.creator.username FROM CardSet c WHERE c.id = :cardSetId")
    Optional<String> findOwnerUsernameByCardSetId(@Param("cardSetId") Long cardSetId);

    @Modifying
    @Query(value = "INSERT INTO accessible_sets (set_id, user_id) VALUES (?1, ?2)", nativeQuery = true)
    void addApprovedUser(Long cardSetId, Long userId);

}