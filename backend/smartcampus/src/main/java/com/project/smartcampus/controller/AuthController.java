package com.project.smartcampus.controller;

import com.project.smartcampus.dto.ApiMessageResponse;
import com.project.smartcampus.dto.AuthResponse;
import com.project.smartcampus.dto.ForgotPasswordRequest;
import com.project.smartcampus.dto.ForgotPasswordResponse;
import com.project.smartcampus.dto.LoginRequest;
import com.project.smartcampus.dto.ResetPasswordRequest;
import com.project.smartcampus.dto.SignupRequest;
import com.project.smartcampus.dto.UpdateNotificationSettingsRequest;
import com.project.smartcampus.dto.UpdateProfileRequest;
import com.project.smartcampus.dto.UserDTO;
import com.project.smartcampus.services.AuthService;
import com.project.smartcampus.services.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller handling authentication-related endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    public AuthController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    /**
     * Registers a new local account and returns a JWT token.
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    /**
     * Authenticates a local account and returns a JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Generates a password reset token for an email if an account exists.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    /**
     * Completes a password reset using a valid reset token.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiMessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    /**
     * Returns the currently authenticated user's info.
     * Used by the frontend to validate the JWT token on app load.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        UserDTO user = userService.getCurrentUser(authentication);
        return ResponseEntity.ok(user);
    }

    /**
     * Updates profile details of the currently authenticated user.
     */
    @PutMapping("/me/profile")
    public ResponseEntity<UserDTO> updateCurrentUserProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateCurrentUserProfile(authentication, request));
    }

    /**
     * Updates notification preference of the currently authenticated user.
     */
    @PutMapping("/me/notification-settings")
    public ResponseEntity<UserDTO> updateNotificationSettings(
            Authentication authentication,
            @Valid @RequestBody UpdateNotificationSettingsRequest request) {
        return ResponseEntity.ok(userService.updateCurrentUserNotificationSettings(authentication, request));
    }

    /**
     * Called after a successful OAuth2 login.
     * The actual token generation and redirect is handled by OAuth2LoginSuccessHandler.
     * This endpoint is a fallback/informational endpoint.
     */
    @GetMapping("/login/success")
    public ResponseEntity<String> loginSuccess() {
        return ResponseEntity.ok("Login successful. Token issued via redirect.");
    }

    /**
     * Called when OAuth2 login fails.
     */
    @GetMapping("/login/failure")
    public ResponseEntity<String> loginFailure() {
        return ResponseEntity.status(401).body("OAuth2 login failed. Please try again.");
    }

    /**
     * Logs out the current user.
     * Since we use stateless JWT, the frontend should discard the token.
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully. Please discard your token.");
    }
}
