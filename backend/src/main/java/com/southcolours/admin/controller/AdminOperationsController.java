package com.southcolours.admin.controller;

import com.southcolours.admin.dto.AdminDashboardDto;
import com.southcolours.admin.dto.CustomerSummaryDto;
import com.southcolours.admin.dto.StoreSettingsDto;
import com.southcolours.admin.service.AdminOperationsService;
import com.southcolours.cart.entity.Coupon;
import com.southcolours.catalog.entity.Banner;
import com.southcolours.security.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Store Operations", description = "Endpoints for Admin Dashboard KPIs, Customer Lists, Coupons, Banners, and Settings")
public class AdminOperationsController {

    private final AdminOperationsService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard KPI cards, sales overview chart, and category shares")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardMetrics(), "Dashboard data retrieved"));
    }

    @GetMapping("/customers")
    @Operation(summary = "List registered customers with order counts and total spending")
    public ResponseEntity<ApiResponse<List<CustomerSummaryDto>>> getCustomers(
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getCustomersList(search), "Customers retrieved"));
    }

    @GetMapping("/coupons")
    @Operation(summary = "Get list of all promotional coupons")
    public ResponseEntity<ApiResponse<List<Coupon>>> getCoupons() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllCoupons(), "Coupons retrieved"));
    }

    @GetMapping("/banners")
    @Operation(summary = "Get all promotional marketing banners")
    public ResponseEntity<ApiResponse<List<Banner>>> getBanners() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllBanners(), "Banners retrieved"));
    }

    @GetMapping("/settings")
    @Operation(summary = "Get administrative store settings and configuration flags")
    public ResponseEntity<ApiResponse<StoreSettingsDto>> getStoreSettings() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStoreSettings(), "Store settings retrieved"));
    }

    @PostMapping("/store-profile")
    @Operation(summary = "Save Store profile name, phone, and contact email")
    public ResponseEntity<ApiResponse<String>> saveStoreProfile(
            @RequestBody java.util.Map<String, Object> payload
    ) {
        String storeName = payload.get("storeName") != null ? payload.get("storeName").toString() : null;
        String phone = payload.get("phone") != null ? payload.get("phone").toString() : null;
        String email = payload.get("email") != null ? payload.get("email").toString() : null;

        adminService.updateStoreProfile(storeName, phone, email);
        return ResponseEntity.ok(ApiResponse.success("SUCCESS", "Store profile details saved successfully"));
    }

    @PostMapping("/store-address")
    @Operation(summary = "Save Store pickup & shipping address")
    public ResponseEntity<ApiResponse<String>> saveStoreAddress(
            @RequestBody java.util.Map<String, Object> payload
    ) {
        String address = payload.get("address") != null ? payload.get("address").toString() : null;

        adminService.updateStoreAddress(address);
        return ResponseEntity.ok(ApiResponse.success("SUCCESS", "Store address saved successfully"));
    }

    @PostMapping("/tax-shipping")
    @Operation(summary = "Save Tax & shipping thresholds")
    public ResponseEntity<ApiResponse<String>> saveTaxAndShipping(
            @RequestBody java.util.Map<String, Object> payload
    ) {
        String gstRate = payload.get("gstRate") != null ? payload.get("gstRate").toString() : null;
        String freeShippingAbove = payload.get("freeShippingAbove") != null ? payload.get("freeShippingAbove").toString() : null;
        String standardShippingFee = payload.get("standardShippingFee") != null ? payload.get("standardShippingFee").toString() : null;

        adminService.updateTaxAndShipping(gstRate, freeShippingAbove, standardShippingFee);
        return ResponseEntity.ok(ApiResponse.success("SUCCESS", "Tax and shipping rules saved successfully"));
    }

    @PostMapping("/payment-settings")
    @Operation(summary = "Save Razorpay key ID, secret, and COD status from Admin Settings")
    public ResponseEntity<ApiResponse<String>> savePaymentSettings(
            @RequestBody java.util.Map<String, Object> payload
    ) {
        String keyId = payload.get("razorpayKeyId") != null ? payload.get("razorpayKeyId").toString() : null;
        String keySecret = payload.get("razorpayKeySecret") != null ? payload.get("razorpayKeySecret").toString() : null;
        boolean cod = payload.get("codEnabled") != null && Boolean.parseBoolean(payload.get("codEnabled").toString());

        adminService.updatePaymentSettings(keyId, keySecret, cod);
        return ResponseEntity.ok(ApiResponse.success("SUCCESS", "Payment gateway credentials saved to backend"));
    }

    @PostMapping("/whatsapp-settings")
    @Operation(summary = "Save automated WhatsApp order confirmation template, credentials, and toggle status")
    public ResponseEntity<ApiResponse<String>> saveWhatsAppSettings(
            @RequestBody java.util.Map<String, Object> payload
    ) {
        boolean enabled = payload.get("whatsappEnabled") != null && Boolean.parseBoolean(payload.get("whatsappEnabled").toString());
        String adminPhone = payload.get("whatsappAdminPhone") != null ? payload.get("whatsappAdminPhone").toString() : null;
        String template = payload.get("whatsappTemplate") != null ? payload.get("whatsappTemplate").toString() : null;
        String phoneId = payload.get("whatsappPhoneNumberId") != null ? payload.get("whatsappPhoneNumberId").toString() : null;
        String token = payload.get("whatsappAccessToken") != null ? payload.get("whatsappAccessToken").toString() : null;

        adminService.updateWhatsAppSettings(enabled, adminPhone, template, phoneId, token);
        return ResponseEntity.ok(ApiResponse.success("SUCCESS", "WhatsApp notification settings updated successfully"));
    }
}
