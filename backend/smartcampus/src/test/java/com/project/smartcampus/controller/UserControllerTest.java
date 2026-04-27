package com.project.smartcampus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.smartcampus.dto.RoleUpdateRequest;
import com.project.smartcampus.dto.UserDTO;
import com.project.smartcampus.enums.Role;
import com.project.smartcampus.services.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private UserService userService;

    private UserDTO sampleUser(Long id, Role role) {
        return UserDTO.builder()
                .id(id)
                .email("user" + id + "@example.com")
                .name("User " + id)
                .role(role)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getAllUsers_withAdminRole_shouldReturn200() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(
                sampleUser(1L, Role.ADMIN),
                sampleUser(2L, Role.USER)
        ));

        mockMvc.perform(get("/api/users").with(user("1").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].role").value("ADMIN"))
                .andExpect(jsonPath("$[1].role").value("USER"));
    }

    @Test
    void getAllUsers_withUserRole_shouldReturn403() throws Exception {
        mockMvc.perform(get("/api/users").with(user("2").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllUsers_withTechnicianRole_shouldReturn403() throws Exception {
        mockMvc.perform(get("/api/users").with(user("2").roles("TECHNICIAN")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllUsers_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getUserById_withAdminRole_shouldReturn200() throws Exception {
        when(userService.getUserById(2L)).thenReturn(sampleUser(2L, Role.USER));

        mockMvc.perform(get("/api/users/2").with(user("1").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void updateUserRole_withAdminRole_shouldReturn200() throws Exception {
        RoleUpdateRequest request = new RoleUpdateRequest(Role.TECHNICIAN);
        UserDTO updated = sampleUser(2L, Role.TECHNICIAN);

        when(userService.updateUserRole(ArgumentMatchers.eq(2L), ArgumentMatchers.any()))
                .thenReturn(updated);

        mockMvc.perform(put("/api/users/2/role")
                        .with(user("1").roles("ADMIN")).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("TECHNICIAN"));
    }

    @Test
    void deleteUser_withAdminRole_shouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/users/2").with(user("1").roles("ADMIN")).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteUser_withUserRole_shouldReturn403() throws Exception {
        // CSRF is disabled in security config, so no csrf() needed
        mockMvc.perform(delete("/api/users/2").with(user("2").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUsersByRole_withAdminRole_shouldReturn200() throws Exception {
        when(userService.getUsersByRole(Role.TECHNICIAN))
                .thenReturn(List.of(sampleUser(3L, Role.TECHNICIAN)));

        mockMvc.perform(get("/api/users/role/TECHNICIAN").with(user("1").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].role").value("TECHNICIAN"));
    }
}
