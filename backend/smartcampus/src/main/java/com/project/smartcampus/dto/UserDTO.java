package com.project.smartcampus.dto;

import com.project.smartcampus.enums.Role;
import com.project.smartcampus.enums.TechnicianSpecialty;
import com.project.smartcampus.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for User entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String email;
    private String name;
    private String profilePicture;
    private Role role;
    private TechnicianSpecialty technicianSpecialty;
    private String provider;
    private Boolean notificationsEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Converts a User entity to a UserDTO.
     *
     * @param user the user entity
     * @return UserDTO representation
     */
    public static UserDTO fromUser(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .technicianSpecialty(user.getTechnicianSpecialty())
                .provider(user.getProvider())
                .notificationsEnabled(Boolean.TRUE.equals(user.getNotificationsEnabled()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
