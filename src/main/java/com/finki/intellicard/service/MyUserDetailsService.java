package com.finki.intellicard.service;

import com.finki.intellicard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.finki.intellicard.model.UserPrincipal;

@Service
public class MyUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    public MyUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public String getUsername() {
        if ("desktop".equals(activeProfile)) {
            return getDesktopUsername();
        }

        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return userDetails.getUsername();
        } catch (Exception e) {
            return getDesktopUsername();
        }
    }

    private String getDesktopUsername() {
        return userRepository.findAll().stream()
                .findFirst()
                .map(user -> user.getUsername())
                .orElse("defaultuser");

    }

    public Long getUserIdByUsername(String username) {
        return userRepository.getUserIdByUsername(username);
    }

    public Long getCurrentUserId() {
        String username = getUsername();
        return getUserIdByUsername(username);
    }
}