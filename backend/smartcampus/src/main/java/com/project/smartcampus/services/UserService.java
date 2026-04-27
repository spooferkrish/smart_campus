package com.project.smartcampus.services;

import com.project.smartcampus.dto.RoleUpdateRequest;
import com.project.smartcampus.dto.UpdateNotificationSettingsRequest;
import com.project.smartcampus.dto.UpdateProfileRequest;
import com.project.smartcampus.dto.UserDTO;
import com.project.smartcampus.entity.User;
import com.project.smartcampus.enums.NotificationType;
import com.project.smartcampus.enums.Role;
import com.project.smartcampus.enums.TechnicianSpecialty;
import com.project.smartcampus.exception.ResourceNotFoundException;
import com.project.smartcampus.exception.UnauthorizedException;
import com.project.smartcampus.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing users and role assignments.
 */
@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * Retrieves the currently authenticated user.
     *
     * @param authentication Spring Security authentication object
     * @return UserDTO of the current user
     */
    public UserDTO getCurrentUser(Authentication authentication) {
        Long userId = extractUserId(authentication);
        return getUserById(userId);
    }

    /**
     * Updates the current user's profile details.
     */
    @Transactional
    public UserDTO updateCurrentUserProfile(Authentication authentication, UpdateProfileRequest request) {
        Long userId = extractUserId(authentication);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setName(request.getName().trim());
        user.setProfilePicture(request.getProfilePicture());

        return UserDTO.fromUser(userRepository.save(user));
    }

    /**
     * Updates the current user's notification preference.
     */
    @Transactional
    public UserDTO updateCurrentUserNotificationSettings(Authentication authentication,
                                                         UpdateNotificationSettingsRequest request) {
        Long userId = extractUserId(authentication);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setNotificationsEnabled(request.getNotificationsEnabled());
        return UserDTO.fromUser(userRepository.save(user));
    }

    /**
     * Retrieves a user by their ID.
     *
     * @param id the user's ID
     * @return UserDTO
     */
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserDTO.fromUser(user);
    }

    /**
     * Retrieves all users (ADMIN only).
     *
     * @return list of all UserDTOs
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDTO::fromUser)
                .collect(Collectors.toList());
    }

    /**
     * Updates the role of a user and notifies them of the change (ADMIN only).
     *
     * @param userId  ID of the user to update
     * @param request new role details
     * @return updated UserDTO
     */
    @Transactional
    public UserDTO updateUserRole(Long userId, RoleUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Role oldRole = user.getRole();
        user.setRole(request.getRole());

        if (request.getRole() == Role.TECHNICIAN) {
            TechnicianSpecialty specialty = request.getTechnicianSpecialty();
            if (specialty == null) {
                specialty = user.getTechnicianSpecialty() != null
                        ? user.getTechnicianSpecialty()
                        : TechnicianSpecialty.GENERAL;
            }
            user.setTechnicianSpecialty(specialty);
        } else {
            user.setTechnicianSpecialty(null);
        }

        User updated = userRepository.save(user);

        log.info("Role changed for user {}: {} → {}", userId, oldRole, request.getRole());

        // Notify the user their role was changed
        notificationService.createNotification(
                userId,
                NotificationType.ROLE_CHANGED,
                "Your Role Has Been Updated",
                "Your account role has been changed from " + oldRole.name() + " to " + request.getRole().name() + ".",
                null,
                null
        );

        return UserDTO.fromUser(updated);
    }

    /**
     * Retrieves all users with a specific role (ADMIN only).
     *
     * @param role the role to filter by
     * @return list of UserDTOs
     */
    public List<UserDTO> getUsersByRole(Role role) {
        return userRepository.findByRole(role)
                .stream()
                .map(UserDTO::fromUser)
                .collect(Collectors.toList());
    }

    /**
     * Deletes a user by ID (ADMIN only).
     *
     * @param id ID of the user to delete
     */
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
        log.info("Deleted user with id: {}", id);
    }

    /**
     * Extracts the user ID from the Authentication object.
     * Works with both JWT-based and OAuth2 authentication.
     */
    public Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new UnauthorizedException("Authentication is required.");
        }

        if (authentication.getPrincipal() instanceof OAuth2User oAuth2User) {
            Object userId = oAuth2User.getAttribute("userId");
            if (userId instanceof Long) return (Long) userId;
            if (userId instanceof Integer) return ((Integer) userId).longValue();
        }

        // For JWT-based auth, the principal is the user ID string
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new UnauthorizedException("Invalid authentication context.");
        }
    }

    /**
     * Extracts the user's email from the Authentication object.
     * Works with both JWT-based and OAuth2 authentication.
     */
    public String extractUserEmail(Authentication authentication) {
        Long userId = extractUserId(authentication);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return user.getEmail();
    }
}
