package com.finki.intellicard.repository;

import com.finki.intellicard.model.AccessRequest;
import com.finki.intellicard.model.enums.AccessRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AccessRequestRepository extends JpaRepository<AccessRequest, Long> {

    @Query("SELECT r FROM AccessRequest r WHERE r.cardSet.id = :cardSetId AND r.status = :status")
    List<AccessRequest> findByCardSetIdAndStatus(@Param("cardSetId") Long cardSetId,
                                                 @Param("status") AccessRequestStatus status);

    Optional<AccessRequest> findByCardSetIdAndRequesterId(Long cardSetId, Long requesterId);

    List<AccessRequest> findByRequesterId(Long requesterId);

    void deleteByRequesterId(Long requesterId);

    void deleteByCardSetId(Long cardSetId);
}