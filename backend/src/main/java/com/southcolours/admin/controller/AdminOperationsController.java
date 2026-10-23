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
}
