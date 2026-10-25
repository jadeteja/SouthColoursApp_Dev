package com.southcolours.security.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String otpCode) {
        if (mailSender == null) {
            log.warn("JavaMailSender is not configured. Simulating OTP email to {}: OTP={}", toEmail, otpCode);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Southcolours - Password Reset Verification Code");
            message.setText("Hello,\n\n"
                    + "Your verification code to reset your Southcolours password is: " + otpCode + "\n\n"
                    + "This code is valid for 10 minutes. If you did not request this, please ignore this email.\n\n"
                    + "Warm regards,\n"
                    + "Southcolours Team");
            mailSender.send(message);
            log.info("Password reset OTP email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send reset email to {}: {}", toEmail, e.getMessage(), e);
            // Log fallback so user is not completely blocked in development/testing
            log.info("DEVELOPMENT FALLBACK: OTP for {} is {}", toEmail, otpCode);
        }
    }
}
