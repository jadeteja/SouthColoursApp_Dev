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
        return users.stream().map(u -> CustomerSummaryDto.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phoneNumber(u.getPhoneNumber() != null ? u.getPhoneNumber() : "+91 9876543210")
                .orderCount(12)
                .totalSpent(new BigDecimal("15499"))
                .registeredDate(u.getCreatedAt() != null ? u.getCreatedAt().format(FORMATTER) : "12 May 2024")
                .isActive(u.getIsActive())
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public StoreSettingsDto getStoreSettings() {
        return StoreSettingsDto.builder()
                .storeName("Southcolours")
                .storeLogoUrl("https://southcolours.com/logo.png")
                .supportEmail("support@southcolours.com")
                .supportPhone("+91 9876543210")
                .storeAddress("123, Green Park, Bangalore, Karnataka - 560001")
                .taxPercentage("5%")
                .freeShippingThreshold("1500")
                .defaultShippingFee("99")
                .razorpayLiveMode(false)
                .emailNotificationsEnabled(true)
                .twoFactorAuthEnabled(true)
                .primaryThemeColor("#FF4081")
                .defaultLanguage("English")
                .razorpayKeyId(getEffectiveRazorpayKeyId())
                .razorpayKeySecret(getEffectiveRazorpayKeySecret())
                .codEnabled(getEffectiveCodEnabled())
                .build();
    }
}
