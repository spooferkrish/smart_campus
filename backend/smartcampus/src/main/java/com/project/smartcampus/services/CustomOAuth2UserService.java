package com.project.smartcampus.services;

import com.project.smartcampus.enums.Role;
import com.project.smartcampus.entity.User;
import com.project.smartcampus.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Custom OAuth2 user service that registers or updates users after Google login.
 * On first sign-in, creates a new User with the default USER role.
 * On subsequent sign-ins, updates the user's name/picture if changed.
 */
@Slf4j
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Wrapped for testability so OAuth2 provider calls can be stubbed in unit tests.
    protected OAuth2User loadProviderUser(OAuth2UserRequest userRequest) {
        return super.loadUser(userRequest);
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = loadProviderUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String providerId = oAuth2User.getAttribute("sub");
        String provider = userRequest.getClientRegistration().getRegistrationId();

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isEmpty()) {
            log.info("Registering new OAuth2 user: {}", email);
            user = User.builder()
                    .email(email)
                    .name(name)
                    .profilePicture(picture)
                    .role(Role.USER)
                    .provider(provider)
                    .providerId(providerId)
                    .build();
            user = userRepository.save(user);
        } else {
            user = existingUser.get();
            boolean changed = false;

            if (name != null && !name.equals(user.getName())) {
                user.setName(name);
                changed = true;
            }
            if (picture != null && !picture.equals(user.getProfilePicture())) {
                user.setProfilePicture(picture);
                changed = true;
            }
            if (changed) {
                log.info("Updating OAuth2 user profile: {}", email);
                user = userRepository.save(user);
            }
        }

        // Build custom attributes including DB user info
        Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
        attributes.put("userId", user.getId());
        attributes.put("role", user.getRole().name());

        return new DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                attributes,
                "email"
        );
    }
}
