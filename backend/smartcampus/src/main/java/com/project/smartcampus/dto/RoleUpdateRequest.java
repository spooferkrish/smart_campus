package com.project.smartcampus.dto;

import com.project.smartcampus.enums.Role;
import com.project.smartcampus.enums.TechnicianSpecialty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a user's role.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleUpdateRequest {

    @NotNull(message = "Role must not be null")
    private Role role;

    private TechnicianSpecialty technicianSpecialty;

    public RoleUpdateRequest(Role role) {
        this.role = role;
        this.technicianSpecialty = null;
    }
}
