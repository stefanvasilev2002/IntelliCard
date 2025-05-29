package com.finki.intellicard.repository;

import com.finki.intellicard.model.User;
import com.finki.intellicard.record.UserRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query("SELECT u.id FROM Users u where u.username = :username")
    Long getUserIdByUsername(@Param("username") String username);

    @Query("SELECT new com.finki.intellicard.record.UserRecord(u.id, u.fullName, u.username) " +
            "FROM Users u WHERE u.username = :username")
    Optional<UserRecord> findUserRecordByUsername(@Param("username") String username);
    boolean existsByEmail(String email);
}
