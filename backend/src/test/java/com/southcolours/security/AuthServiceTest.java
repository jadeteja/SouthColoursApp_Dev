package com.southcolours.security;

import com.southcolours.security.dto.AuthResponse;
import com.southcolours.security.dto.LoginRequest;
import com.southcolours.security.dto.RegisterRequest;
import com.southcolours.security.entity.Role;
import com.southcolours.security.entity.User;
import com.southcolours.security.jwt.JwtService;
import com.southcolours.security.repository.RefreshTokenRepository;
import com.southcolours.security.repository.RoleRepository;
import com.southcolours.security.repository.UserRepository;
import com.southcolours.security.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private Role customerRole;

    @BeforeEach
    void setUp() {
        customerRole = Role.builder().id(1L).name("ROLE_CUSTOMER").build();
        sampleUser = User.builder()
                .id(1L)
                .email("test@southcolours.com")
                .passwordHash("encoded_secret")
                .fullName("Test Customer")
                .isActive(true)
                .roles(new HashSet<>(Collections.singletonList(customerRole)))
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new customer")
    void registerCustomer_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("new@southcolours.com");
        req.setFullName("New User");
        req.setPassword("Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleRepository.findByName("ROLE_CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_secret");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(any(), any())).thenReturn("mocked_jwt_token");

        AuthResponse response = authService.registerCustomer(req);

        assertNotNull(response);
        assertEquals("mocked_jwt_token", response.getAccessToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should reject login when passwords do not match")
    void login_InvalidPassword_ThrowsException() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@southcolours.com");
        req.setPassword("WrongPassword");

        when(userRepository.findByEmail("test@southcolours.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", "encoded_secret")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(req, false));
    }
}
