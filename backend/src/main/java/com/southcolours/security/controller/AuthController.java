package com.southcolours.security.controller;

import com.southcolours.security.dto.*;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.UserRepository;
import com.southcolours.security.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Customer Authentication", description = "Endpoints for Customer Registration, Login, Google OIDC, and Session Management")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    @Operation(summary = "Register customer with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerCustomer(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Customer registration successful"));
    }

    @PostMapping("/login")
    @Operation(summary = "Customer login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request, false);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a 6-digit OTP code to reset password via email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Verification code sent to your email."));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using received OTP code")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully. Please login with your new password."));
    }

    @PostMapping("/google")
    @Operation(summary = "Sign in or sign up with Google OIDC identity")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Google sign-in successful"));
    }

    @GetMapping(value = "/google-web", produces = org.springframework.http.MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Render Google Sign-In HTML page with official Google Identity button")
    public ResponseEntity<String> googleWebPage(@RequestParam(name = "clientId", required = false) String clientId) {
        String effectiveClientId = (clientId != null && !clientId.trim().isEmpty())
                ? clientId.trim()
                : "381254757749-eshpqt63tcb59mpq231jrs8ugnq8qmlp.apps.googleusercontent.com";

        String html = "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>Southcolours - Google Sign-In</title>\n" +
                "    <script src=\"https://accounts.google.com/gsi/client\" async defer></script>\n" +
                "    <style>\n" +
                "        * { box-sizing: border-box; }\n" +
                "        body {\n" +
                "            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\n" +
                "            background: linear-gradient(135deg, #FFF0F5 0%, #FFFFFF 100%);\n" +
                "            margin: 0; padding: 24px;\n" +
                "            display: flex; align-items: center; justify-content: center;\n" +
                "            min-height: 90vh;\n" +
                "            color: #1e293b;\n" +
                "        }\n" +
                "        .card {\n" +
                "            background: #ffffff;\n" +
                "            border-radius: 24px;\n" +
                "            padding: 32px 24px;\n" +
                "            width: 100%;\n" +
                "            max-width: 380px;\n" +
                "            text-align: center;\n" +
                "            box-shadow: 0 10px 30px rgba(235, 78, 142, 0.12);\n" +
                "            border: 1px solid rgba(235, 78, 142, 0.15);\n" +
                "        }\n" +
                "        .logo { font-size: 40px; margin-bottom: 8px; }\n" +
                "        h2 { margin: 8px 0 4px 0; color: #1e293b; font-size: 22px; font-weight: 700; }\n" +
                "        p { margin: 0 0 24px 0; color: #64748b; font-size: 14px; }\n" +
                "        .btn-box { display: flex; justify-content: center; margin: 16px 0; min-height: 48px; }\n" +
                "        .status { margin-top: 16px; font-size: 13px; color: #64748b; min-height: 20px; }\n" +
                "        .cancel-btn {\n" +
                "            margin-top: 20px;\n" +
                "            background: transparent;\n" +
                "            border: none;\n" +
                "            color: #94a3b8;\n" +
                "            font-size: 13px;\n" +
                "            cursor: pointer;\n" +
                "            text-decoration: underline;\n" +
                "        }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"card\">\n" +
                "        <div class=\"logo\">🌸</div>\n" +
                "        <h2>Southcolours</h2>\n" +
                "        <p>Choose your Google Account to sign in</p>\n" +
                "        <div id=\"g_id_onload\"\n" +
                "             data-client_id=\"" + effectiveClientId + "\"\n" +
                "             data-callback=\"handleCredentialResponse\"\n" +
                "             data-auto_prompt=\"false\">\n" +
                "        </div>\n" +
                "        <div class=\"btn-box\">\n" +
                "            <div class=\"g_id_signin\"\n" +
                "                 data-type=\"standard\"\n" +
                "                 data-size=\"large\"\n" +
                "                 data-theme=\"outline\"\n" +
                "                 data-text=\"continue_with\"\n" +
                "                 data-shape=\"pill\"\n" +
                "                 data-logo_alignment=\"left\">\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        <div id=\"status\" class=\"status\">Tap above to choose account</div>\n" +
                "        <button class=\"cancel-btn\" onclick=\"window.location.href='southcolours://login-cancel'\">Cancel and return</button>\n" +
                "    </div>\n" +
                "    <script>\n" +
                "        function parseJwt(token) {\n" +
                "            try {\n" +
                "                var base64Url = token.split('.')[1];\n" +
                "                var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');\n" +
                "                var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {\n" +
                "                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);\n" +
                "                }).join(''));\n" +
                "                return JSON.parse(jsonPayload);\n" +
                "            } catch (e) { return {}; }\n" +
                "        }\n" +
                "        function handleCredentialResponse(response) {\n" +
                "            document.getElementById('status').innerText = 'Signing in...';\n" +
                "            var payload = parseJwt(response.credential);\n" +
                "            var email = payload.email || '';\n" +
                "            var name = payload.name || payload.given_name || email.split('@')[0];\n" +
                "            var avatar = payload.picture || '';\n" +
                "            var returnUrl = 'southcolours://google-auth?email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(name) + '&avatar=' + encodeURIComponent(avatar);\n" +
                "            window.location.href = returnUrl;\n" +
                "        }\n" +
                "    </script>\n" +
                "</body>\n" +
                "</html>";

        return ResponseEntity.ok(html);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using valid refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and revoke refresh session")
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated customer profile")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(authService.mapToUserDto(user), "Current user fetched"));
    }
}
