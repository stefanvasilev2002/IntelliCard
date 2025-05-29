package com.finki.intellicard.service;

import jakarta.transaction.Transactional;
import com.finki.intellicard.model.User;
import com.finki.intellicard.record.RegisterRequestRecord;
import com.finki.intellicard.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void register(RegisterRequestRecord registerRequestRecord) {
        if (registerRequestRecord.password() == null || registerRequestRecord.password().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }

        if (registerRequestRecord.email() != null && userRepository.existsByEmail(registerRequestRecord.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .username(registerRequestRecord.username())
                .password(passwordEncoder.encode(registerRequestRecord.password()))
                .fullName(registerRequestRecord.fullName())
                .email(registerRequestRecord.email())
                .build();

        userRepository.save(user);
    }
}