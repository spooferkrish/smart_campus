package com.project.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import com.project.smartcampus.enums.Role;
import com.project.smartcampus.enums.TechnicianSpecialty;
import com.fasterxml.jackson.annotation.JsonAlias;

/**
 * Request payload for local account signup.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name cannot exceed 120 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    @JsonAlias({"specialty", "category", "technicianCategory"})
    private TechnicianSpecialty technicianSpecialty;

    public SignupRequest(String name, String email, String password, Role role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.technicianSpecialty = null;
    }
}
