package com.southcolours.security.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleAuthRequest {
    @NotBlank(message = "Google ID token or authorization credential is required")
    private String idToken;
    private String email;
    private String fullName;
    private String avatarUrl;
}
