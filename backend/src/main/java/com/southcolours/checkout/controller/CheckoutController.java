package com.southcolours.checkout.controller;

import com.southcolours.checkout.dto.CreateCheckoutOrderRequest;
import com.southcolours.checkout.dto.DirectOrderPlacementRequest;
import com.southcolours.checkout.dto.RazorpayVerifyRequest;
import com.southcolours.checkout.entity.Order;
import com.southcolours.checkout.service.CheckoutService;
import com.southcolours.security.dto.ApiResponse;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
@Tag(name = "Checkout & Payments", description = "Endpoints for initiating order checkout sessions and Razorpay gateway verification")
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final UserRepository userRepository;

    @PostMapping("/place-order")
    @Operation(summary = "Place a direct customer order (COD or direct payment) and persist to database")
    public ResponseEntity<ApiResponse<Map<String, Object>>> placeDirectOrder(
            @RequestBody DirectOrderPlacementRequest request
    ) {
        Order savedOrder = checkoutService.placeDirectOrder(request);
        Map<String, Object> responseData = Map.of(
                "orderId", savedOrder.getId(),
                "orderNumber", savedOrder.getOrderNumber(),
                "totalAmount", savedOrder.getTotalAmount(),
                "status", savedOrder.getStatus()
        );
        return ResponseEntity.ok(ApiResponse.success(responseData, "Order placed successfully"));
    }

    @PostMapping("/initiate")
    @Operation(summary = "Initiate checkout, reserve stock, and generate Razorpay order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initiateCheckout(
            @Valid @RequestBody CreateCheckoutOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Map<String, Object> checkoutData = checkoutService.initiateCheckout(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(checkoutData, "Checkout initialized successfully"));
    }

    @PostMapping("/verify-payment")
    @Operation(summary = "Verify Razorpay HMAC-SHA256 payment signature and finalize order")
    public ResponseEntity<ApiResponse<Boolean>> verifyPayment(@Valid @RequestBody RazorpayVerifyRequest request) {
        boolean verified = checkoutService.verifyRazorpayPayment(request);
        if (verified) {
            return ResponseEntity.ok(ApiResponse.success(true, "Payment verified and order placed successfully"));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Payment verification failed"));
        }
    }
}
