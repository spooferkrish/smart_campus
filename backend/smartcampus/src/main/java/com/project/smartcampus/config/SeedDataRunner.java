package com.project.smartcampus.config;

import com.project.smartcampus.entity.User;
import com.project.smartcampus.enums.Role;
import com.project.smartcampus.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Locale;

/**
 * Creates default local privileged accounts at startup when enabled.
 */
@Slf4j
@Component
public class SeedDataRunner implements CommandLineRunner {

    private static final String LOCAL_PROVIDER = "LOCAL";

    private final SeedProperties seedProperties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedDataRunner(SeedProperties seedProperties,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.seedProperties = seedProperties;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedProperties.isEnabled()) {
            log.debug("Seed data tooling is disabled.");
            return;
        }

        validateRequiredSeedSettings();

        seedUser(
                Role.ADMIN,
                seedProperties.getAdminName(),
                seedProperties.getAdminEmail(),
                seedProperties.getAdminPassword()
        );

        seedUser(
                Role.TECHNICIAN,
                seedProperties.getTechnicianName(),
                seedProperties.getTechnicianEmail(),
                seedProperties.getTechnicianPassword()
        );
    }

    private void validateRequiredSeedSettings() {
        validateRequired(seedProperties.getAdminName(), "app.seed.admin-name");
        validateRequired(seedProperties.getAdminEmail(), "app.seed.admin-email");
        validateRequired(seedProperties.getAdminPassword(), "app.seed.admin-password");

        validateRequired(seedProperties.getTechnicianName(), "app.seed.technician-name");
        validateRequired(seedProperties.getTechnicianEmail(), "app.seed.technician-email");
        validateRequired(seedProperties.getTechnicianPassword(), "app.seed.technician-password");
    }

    private void validateRequired(String value, String key) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException("Missing required seed configuration: " + key);
        }
    }

    private void seedUser(Role expectedRole, String name, String email, String rawPassword) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        userRepository.findByEmail(normalizedEmail).ifPresentOrElse(existing -> {
            if (existing.getRole() != expectedRole) {
                log.warn(
                        "Seed account {} already exists with role {} (expected {}). Leaving unchanged.",
                        normalizedEmail,
                        existing.getRole(),
                        expectedRole
                );
            } else {
                log.info("Seed account already exists, skipping: {} ({})", normalizedEmail, expectedRole);
            }
        }, () -> {
            User seededUser = User.builder()
                    .name(name.trim())
                    .email(normalizedEmail)
                    .role(expectedRole)
                    .provider(LOCAL_PROVIDER)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .notificationsEnabled(true)
                    .build();

            userRepository.save(seededUser);
            log.info("Seeded {} account: {}", expectedRole, normalizedEmail);
        });
    }
}
