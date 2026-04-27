package com.project.smartcampus.config;

import com.project.smartcampus.entity.User;
import com.project.smartcampus.enums.Role;
import com.project.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuth2LoginSuccessHandlerTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RedirectStrategy redirectStrategy;

    private OAuth2LoginSuccessHandler handler;

    @BeforeEach
    void setUp() {
        handler = new OAuth2LoginSuccessHandler(jwtUtil, userRepository);
        ReflectionTestUtils.setField(handler, "frontendUrl", "http://localhost:5173");
        handler.setRedirectStrategy(redirectStrategy);
    }

    private Authentication authenticationForEmail(String email) {
        OAuth2User oauthUser = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("email", email, "sub", "google-sub"),
                "email"
        );

        return new UsernamePasswordAuthenticationToken(
                oauthUser,
                null,
                oauthUser.getAuthorities()
        );
    }

    @Test
    void onAuthenticationSuccess_shouldGenerateTokenAndRedirectToFrontend() throws Exception {
        User user = User.builder()
                .id(7L)
                .email("oauth.user@example.com")
                .name("OAuth User")
                .role(Role.USER)
                .build();

        when(userRepository.findByEmail("oauth.user@example.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");

        Authentication authentication = authenticationForEmail("oauth.user@example.com");
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.onAuthenticationSuccess(request, response, authentication);

        verify(redirectStrategy).sendRedirect(
                request,
                response,
                "http://localhost:5173/oauth2/redirect?token=jwt-token"
        );
    }

    @Test
    void onAuthenticationSuccess_shouldThrowWhenUserNotFound() {
        when(userRepository.findByEmail("missing.user@example.com")).thenReturn(Optional.empty());

        Authentication authentication = authenticationForEmail("missing.user@example.com");
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertThatThrownBy(() -> handler.onAuthenticationSuccess(request, response, authentication))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found after OAuth2 login");

        verifyNoInteractions(jwtUtil);
    }
}
