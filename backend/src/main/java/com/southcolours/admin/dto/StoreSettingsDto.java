package com.southcolours.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StoreSettingsDto {
    private String storeName;
    private String storeLogoUrl;
    private String supportEmail;
    private String supportPhone;
    private String storeAddress;
    private String taxPercentage;
    private String freeShippingThreshold;
    private String defaultShippingFee;
    private boolean razorpayLiveMode;
    private boolean emailNotificationsEnabled;
    private boolean twoFactorAuthEnabled;
    private String primaryThemeColor;
    private String defaultLanguage;
    private String razorpayKeyId;
    private String razorpayKeySecret;
    private boolean codEnabled;
}
