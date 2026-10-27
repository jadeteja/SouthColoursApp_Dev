package com.southcolours.admin.service;

import com.southcolours.admin.dto.*;
import com.southcolours.cart.entity.Coupon;
import com.southcolours.cart.repository.CouponRepository;
import com.southcolours.catalog.entity.Banner;
import com.southcolours.catalog.repository.BannerRepository;
import com.southcolours.catalog.repository.ProductRepository;
import com.southcolours.checkout.entity.Order;
import com.southcolours.checkout.repository.OrderRepository;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminOperationsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final BannerRepository bannerRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");

    @org.springframework.beans.factory.annotation.Value("${app.razorpay.key-id:rzp_test_placeholder}")
    private String configuredRazorpayKeyId;

    @org.springframework.beans.factory.annotation.Value("${app.razorpay.key-secret:razorpay_secret_placeholder}")
    private String configuredRazorpayKeySecret;

    private static String activeRazorpayKeyId = null;
    private static String activeRazorpayKeySecret = null;
    private static boolean activeCodEnabled = true;

    // Store Profile & Address Configuration State
    private static String activeStoreName = "Southcolours";
    private static String activeSupportPhone = "+91 9876543210";
    private static String activeSupportEmail = "support@southcolours.com";
    private static String activeStoreAddress = "123, Green Park, Bangalore, Karnataka - 560001";
    private static String activeTaxPercentage = "5%";
    private static String activeFreeShippingThreshold = "1500";
    private static String activeDefaultShippingFee = "99";

    // WhatsApp Notification Configuration State
    private static boolean whatsappEnabled = false;
    private static String whatsappAdminPhone = "+91 9876543210";
    private static String whatsappTemplate = "Hello {customerName}! 🌸\nYour Southcolours order #{orderNumber} for ₹{totalAmount} has been placed successfully!\nYou will shortly receive your order tracking ID from our admin at {adminPhone}.\nThank you for shopping with us!";
    private static String whatsappPhoneNumberId = "";
    private static String whatsappAccessToken = "";

    public void updateWhatsAppSettings(
            boolean enabled,
            String adminPhone,
            String template,
            String phoneNumberId,
            String accessToken
    ) {
        whatsappEnabled = enabled;
        if (adminPhone != null && !adminPhone.isBlank()) whatsappAdminPhone = adminPhone.trim();
        if (template != null && !template.isBlank()) whatsappTemplate = template.trim();
        if (phoneNumberId != null) whatsappPhoneNumberId = phoneNumberId.trim();
        if (accessToken != null) whatsappAccessToken = accessToken.trim();
        log.info("WhatsApp settings updated: enabled={}, adminPhone={}, phoneNumberId={}", enabled, whatsappAdminPhone, whatsappPhoneNumberId);
    }

    public boolean isWhatsappEnabled() { return whatsappEnabled; }
    public String getWhatsappAdminPhone() { return whatsappAdminPhone; }
    public String getWhatsappTemplate() { return whatsappTemplate; }
    public String getWhatsappPhoneNumberId() { return whatsappPhoneNumberId; }
    public String getWhatsappAccessToken() { return whatsappAccessToken; }

    public void updatePaymentSettings(String keyId, String keySecret, boolean codEnabled) {
        if (keyId != null && !keyId.trim().isEmpty()) {
            activeRazorpayKeyId = keyId.trim();
        }
        if (keySecret != null && !keySecret.trim().isEmpty()) {
            activeRazorpayKeySecret = keySecret.trim();
        }
        activeCodEnabled = codEnabled;
        log.info("Razorpay credentials saved dynamically: keyId={}", activeRazorpayKeyId);
    }

    public String getEffectiveRazorpayKeyId() {
        if (activeRazorpayKeyId != null && !activeRazorpayKeyId.isEmpty()) {
            return activeRazorpayKeyId;
        }
        return configuredRazorpayKeyId;
    }

    public String getEffectiveRazorpayKeySecret() {
        if (activeRazorpayKeySecret != null && !activeRazorpayKeySecret.isEmpty()) {
            return activeRazorpayKeySecret;
        }
        return configuredRazorpayKeySecret;
    }

    public boolean getEffectiveCodEnabled() {
        return activeCodEnabled;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboardMetrics() {
        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long newCustomers = userRepository.count();

        List<Order> orders = orderRepository.findAll();
        BigDecimal totalSales = orders.stream()
                .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pending = orders.stream()
                .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus()) || "PROCESSING".equalsIgnoreCase(o.getStatus()))
                .count();

        return AdminDashboardDto.builder()
                .totalOrders(totalOrders)
                .totalSales(totalSales)
                .newCustomers(newCustomers)
                .totalProducts(totalProducts)
                .pendingOrders(pending)
                .lowStockProducts(0)
                .salesOverview(List.of())
                .topCategories(List.of())
                .build();
    }

    @Transactional(readOnly = true)
    public List<CustomerSummaryDto> getCustomersList(String search) {
        List<User> users = userRepository.findAll();
        List<Order> allOrders = orderRepository.findAll();

        return users.stream()
                .filter(u -> u.getRoles().stream().noneMatch(r -> "ROLE_ADMIN".equals(r.getName()) || "ROLE_SUPER_ADMIN".equals(r.getName())))
                .filter(u -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.trim().toLowerCase();
                    return (u.getFullName() != null && u.getFullName().toLowerCase().contains(q))
                            || (u.getEmail() != null && u.getEmail().toLowerCase().contains(q))
                            || (u.getPhoneNumber() != null && u.getPhoneNumber().contains(q));
                })
                .map(u -> {
                    List<Order> userOrders = allOrders.stream()
                            .filter(o -> o.getUser() != null && o.getUser().getId().equals(u.getId()))
                            .collect(Collectors.toList());

                    BigDecimal totalSpent = userOrders.stream()
                            .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                            .map(Order::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return CustomerSummaryDto.builder()
                            .id(u.getId())
                            .fullName(u.getFullName())
                            .email(u.getEmail())
                            .phoneNumber(u.getPhoneNumber() != null ? u.getPhoneNumber() : "")
                            .orderCount(userOrders.size())
                            .totalSpent(totalSpent)
                            .registeredDate(u.getCreatedAt() != null ? u.getCreatedAt().format(FORMATTER) : "Recently")
                            .isActive(u.getIsActive())
                            .build();
                }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public void updateStoreProfile(String storeName, String phone, String email) {
        if (storeName != null && !storeName.isBlank()) activeStoreName = storeName.trim();
        if (phone != null && !phone.isBlank()) activeSupportPhone = phone.trim();
        if (email != null && !email.isBlank()) activeSupportEmail = email.trim();
        log.info("Store profile updated: name={}, phone={}, email={}", activeStoreName, activeSupportPhone, activeSupportEmail);
    }

    public void updateStoreAddress(String address) {
        if (address != null && !address.isBlank()) activeStoreAddress = address.trim();
        log.info("Store address updated: address={}", activeStoreAddress);
    }

    public void updateTaxAndShipping(String gstRate, String freeShippingAbove, String standardShippingFee) {
        if (gstRate != null && !gstRate.isBlank()) activeTaxPercentage = gstRate.trim();
        if (freeShippingAbove != null && !freeShippingAbove.isBlank()) activeFreeShippingThreshold = freeShippingAbove.trim();
        if (standardShippingFee != null && !standardShippingFee.isBlank()) activeDefaultShippingFee = standardShippingFee.trim();
        log.info("Tax & shipping updated: gst={}, freeAbove={}, fee={}", activeTaxPercentage, activeFreeShippingThreshold, activeDefaultShippingFee);
    }

    public StoreSettingsDto getStoreSettings() {
        return StoreSettingsDto.builder()
                .storeName(activeStoreName)
                .storeLogoUrl("https://southcolours.com/logo.png")
                .supportEmail(activeSupportEmail)
                .supportPhone(activeSupportPhone)
                .storeAddress(activeStoreAddress)
                .taxPercentage(activeTaxPercentage)
                .freeShippingThreshold(activeFreeShippingThreshold)
                .defaultShippingFee(activeDefaultShippingFee)
                .razorpayLiveMode(false)
                .emailNotificationsEnabled(true)
                .twoFactorAuthEnabled(true)
                .primaryThemeColor("#FF4081")
                .defaultLanguage("English")
                .razorpayKeyId(getEffectiveRazorpayKeyId())
                .razorpayKeySecret(getEffectiveRazorpayKeySecret())
                .codEnabled(getEffectiveCodEnabled())
                .whatsappEnabled(isWhatsappEnabled())
                .whatsappAdminPhone(getWhatsappAdminPhone())
                .whatsappTemplate(getWhatsappTemplate())
                .whatsappPhoneNumberId(getWhatsappPhoneNumberId())
                .whatsappAccessToken(getWhatsappAccessToken())
                .build();
    }
}
