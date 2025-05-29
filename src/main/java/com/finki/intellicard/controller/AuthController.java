package com.finki.intellicard.controller;

import com.finki.intellicard.record.LoginRequestRecord;
import com.finki.intellicard.record.RegisterRequestRecord;
import com.finki.intellicard.service.LoginService;
import com.finki.intellicard.service.RegisterService;
import com.finki.intellicard.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration")
public class AuthController {

    private final LoginService loginService;
    private final RegisterService registerService;
    private final UserService userService;

    public AuthController(LoginService loginService, RegisterService registerService, UserService userService) {
        this.loginService = loginService;
        this.registerService = registerService;
        this.userService = userService;
    }

    @Operation(summary = "User login",
            description = "Authenticate a user and return a JWT token")
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestRecord loginRequest) {
        try {
            String token = loginService.verify(loginRequest);
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @Operation(summary = "User registration",
            description = "Register a new user in the system")
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequestRecord registerRequest) {
        try {
            if (userService.existsByUsername(registerRequest.username())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
            }

            registerService.register(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body("Registration successful");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed");
        }
    }

    @Operation(summary = "Check username availability",
            description = "Check if a username is available for registration")
    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsernameAvailability(@RequestParam String username) {
        boolean isAvailable = !userService.existsByUsername(username);
        return ResponseEntity.ok(isAvailable);
    }
}