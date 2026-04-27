package com.project.smartcampus.services;

import com.project.smartcampus.config.JwtUtil;
import com.project.smartcampus.dto.ApiMessageResponse;
import com.project.smartcampus.dto.AuthResponse;
import com.project.smartcampus.dto.ForgotPasswordRequest;
import com.project.smartcampus.dto.ForgotPasswordResponse;
import com.project.smartcampus.dto.LoginRequest;
import com.project.smartcampus.dto.ResetPasswordRequest;
import com.project.smartcampus.dto.SignupRequest;
import com.project.smartcampus.dto.UserDTO;
import com.project.smartcampus.entity.User;
import com.project.smartcampus.enums.Role;
import com.project.smartcampus.enums.TechnicianSpecialty;
import com.project.smartcampus.exception.UnauthorizedException;
import com.project.smartcampus.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for local email/password authentication and password reset flows.
 */
@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("An account already exists with this email.");
        }

        TechnicianSpecialty normalizedSpecialty = normalizeTechnicianSpecialty(request.getTechnicianSpecialty());

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
            .technicianSpecialty(
                request.getRole() == Role.TECHNICIAN
                    ? (normalizedSpecialty != null
                        ? normalizedSpecialty
                        : TechnicianSpecialty.GENERAL)
                    : null)
                .provider("LOCAL")
                .notificationsEnabled(true)
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        return AuthResponse.of(token, UserDTO.fromUser(user));
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new UnauthorizedException("This account uses Google sign-in. Please sign in with Google.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (user.getRole() != request.getRole()) {
            throw new UnauthorizedException("Selected role does not match this account.");
        }

        String token = jwtUtil.generateToken(user);
        return AuthResponse.of(token, UserDTO.fromUser(user));
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        if (userOpt.isEmpty()) {
            return ForgotPasswordResponse.builder()
                    .message("If an account exists for this email, a reset token has been generated.")
                    .build();
        }

        User user = userOpt.get();
        String resetToken = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(30);

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiresAt);
        userRepository.save(user);

        log.info("Password reset token generated for {}", normalizedEmail);

        return ForgotPasswordResponse.builder()
                .message("Reset token generated. In production, this should be emailed to the user.")
                .resetToken(resetToken)
                .expiresAt(expiresAt)
                .build();
    }

    @Transactional
    public ApiMessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid reset token."));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Reset token has expired.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ApiMessageResponse.builder()
                .message("Password reset successfully. Please log in with your new password.")
                .build();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private TechnicianSpecialty normalizeTechnicianSpecialty(TechnicianSpecialty specialty) {
        if (specialty == null) {
            return null;
        }

        return switch (specialty.name()) {
            case "OTHER" -> TechnicianSpecialty.OTHER;
            case "GENERAL" -> TechnicianSpecialty.GENERAL;
            case "ELECTRICAL" -> TechnicianSpecialty.ELECTRICAL;
            case "NETWORK" -> TechnicianSpecialty.NETWORK;
            case "EQUIPMENT" -> TechnicianSpecialty.EQUIPMENT;
            case "CLEANING" -> TechnicianSpecialty.CLEANING;
            case "FURNITURE" -> TechnicianSpecialty.FURNITURE;
            default -> TechnicianSpecialty.GENERAL;
        };
    }
}
