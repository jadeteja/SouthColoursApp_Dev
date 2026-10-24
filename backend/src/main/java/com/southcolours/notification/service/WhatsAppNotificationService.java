package com.southcolours.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class WhatsAppNotificationService {

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean sendOrderPlacedMessage(
            String customerPhone,
            String customerName,
            String orderNumber,
            String totalAmount,
            String adminPhone,
            String customTemplate,
            String phoneNumberId,
            String accessToken
    ) {
        if (phoneNumberId == null || phoneNumberId.isBlank() || accessToken == null || accessToken.isBlank()) {
            log.warn("WhatsApp notification skipped: Meta credentials (phoneNumberId or accessToken) not configured.");
            return false;
        }

        if (customerPhone == null || customerPhone.isBlank()) {
            log.warn("WhatsApp notification skipped: Customer phone number is empty.");
            return false;
        }

        // Clean phone number (strip whitespace, ensure no + for Meta Graph API)
        String cleanPhone = customerPhone.replaceAll("[^0-9]", "");

        // Build message body from custom template or default
        String template = (customTemplate != null && !customTemplate.isBlank())
                ? customTemplate
                : "Hello {customerName}! 🌸\nYour Southcolours order #{orderNumber} for ₹{totalAmount} has been placed successfully!\nYou will shortly receive your order tracking ID from our admin at {adminPhone}.\nThank you for shopping with us!";

        String messageText = template
                .replace("{customerName}", customerName != null ? customerName : "Customer")
                .replace("{orderNumber}", orderNumber != null ? orderNumber : "")
                .replace("{totalAmount}", totalAmount != null ? totalAmount : "0")
                .replace("{adminPhone}", adminPhone != null ? adminPhone : "+91 9876543210");

        String url = "https://graph.facebook.com/v20.0/" + phoneNumberId.trim() + "/messages";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken.trim());

            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("to", cleanPhone);
            payload.put("type", "text");

            Map<String, String> textObj = new HashMap<>();
            textObj.put("body", messageText);
            payload.put("text", textObj);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, request, String.class);

            log.info("WhatsApp order confirmation successfully sent to {}", cleanPhone);
            return true;
        } catch (Exception e) {
            log.error("Failed to send WhatsApp message to {}: {}", cleanPhone, e.getMessage());
            return false;
        }
    }
}
