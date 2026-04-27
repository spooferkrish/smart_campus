package com.project.smartcampus.services;

import com.project.smartcampus.entity.User;
import com.project.smartcampus.enums.Role;
import com.project.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomOAuth2UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OAuth2UserRequest userRequest;

    private CustomOAuth2UserService customOAuth2UserService;

    @BeforeEach
    void setUp() {
        customOAuth2UserService = spy(new CustomOAuth2UserService(userRepository));

        ClientRegistration registration = ClientRegistration.withRegistrationId("google")
                .clientId("test-client-id")
                .clientSecret("test-client-secret")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost:8086/login/oauth2/code/google")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .userInfoUri("https://openidconnect.googleapis.com/v1/userinfo")
                .userNameAttributeName("sub")
                .clientName("Google")
                .build();

        when(userRequest.getClientRegistration()).thenReturn(registration);
    }

    private OAuth2User providerUser(String email, String name, String picture, String sub) {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("email", email);
        attributes.put("name", name);
        attributes.put("picture", picture);
        attributes.put("sub", sub);

        return new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "email"
        );
    }

    @Test
    void loadUser_shouldRegisterNewUserWithDefaultRole() {
        OAuth2User googleUser = providerUser(
                "new.user@example.com",
                "New User",
                "https://example.com/new-user.png",
                "google-sub-001"
        );

        doReturn(googleUser).when(customOAuth2UserService).loadProviderUser(userRequest);
        when(userRepository.findByEmail("new.user@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(15L);
            return saved;
        });

        OAuth2User result = customOAuth2UserService.loadUser(userRequest);

        verify(userRepository, times(1)).save(argThat(user ->
                "new.user@example.com".equals(user.getEmail())
                        && "New User".equals(user.getName())
                        && "https://example.com/new-user.png".equals(user.getProfilePicture())
                        && "google-sub-001".equals(user.getProviderId())
                        && "google".equals(user.getProvider())
                        && Role.USER.equals(user.getRole())
        ));

        assertThat((Long) result.getAttribute("userId")).isEqualTo(15L);
        assertThat((String) result.getAttribute("role")).isEqualTo("USER");
    }

    @Test
    void loadUser_shouldUpdateExistingUserProfileWhenChanged() {
        User existing = User.builder()
                .id(22L)
                .email("tech@example.com")
                .name("Old Tech Name")
                .profilePicture("https://example.com/old-tech.png")
                .role(Role.TECHNICIAN)
                .provider("google")
                .providerId("google-sub-existing")
                .build();

        OAuth2User googleUser = providerUser(
                "tech@example.com",
                "Updated Tech Name",
                "https://example.com/new-tech.png",
                "google-sub-existing"
        );

        doReturn(googleUser).when(customOAuth2UserService).loadProviderUser(userRequest);
        when(userRepository.findByEmail("tech@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OAuth2User result = customOAuth2UserService.loadUser(userRequest);

        verify(userRepository, times(1)).save(argThat(user ->
                "Updated Tech Name".equals(user.getName())
                        && "https://example.com/new-tech.png".equals(user.getProfilePicture())
                        && Role.TECHNICIAN.equals(user.getRole())
        ));

        assertThat((Long) result.getAttribute("userId")).isEqualTo(22L);
        assertThat((String) result.getAttribute("role")).isEqualTo("TECHNICIAN");
    }

    @Test
    void loadUser_shouldNotSaveWhenExistingProfileUnchanged() {
        User existing = User.builder()
                .id(30L)
                .email("same.user@example.com")
                .name("Same Name")
                .profilePicture("https://example.com/same.png")
                .role(Role.USER)
                .provider("google")
                .providerId("google-sub-same")
                .build();

        OAuth2User googleUser = providerUser(
                "same.user@example.com",
                "Same Name",
                "https://example.com/same.png",
                "google-sub-same"
        );

        doReturn(googleUser).when(customOAuth2UserService).loadProviderUser(userRequest);
        when(userRepository.findByEmail("same.user@example.com")).thenReturn(Optional.of(existing));

        OAuth2User result = customOAuth2UserService.loadUser(userRequest);

        verify(userRepository, never()).save(any(User.class));
        assertThat((Long) result.getAttribute("userId")).isEqualTo(30L);
        assertThat((String) result.getAttribute("role")).isEqualTo("USER");
    }
}
