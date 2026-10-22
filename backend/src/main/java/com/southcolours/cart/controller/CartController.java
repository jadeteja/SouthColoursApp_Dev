package com.southcolours.cart.controller;

import com.southcolours.cart.dto.AddToCartRequest;
import com.southcolours.cart.dto.ApplyCouponRequest;
import com.southcolours.cart.dto.CartDto;
import com.southcolours.cart.service.CartService;
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

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Shopping Cart", description = "Endpoints for managing items, quantities, and coupons in cart")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get user shopping cart with price calculations")
    public ResponseEntity<ApiResponse<CartDto>> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(cartService.calculateCart(cartService.getOrCreateCart(user.getId()).getId()), "Cart retrieved"));
    }

    @PostMapping("/items")
    @Operation(summary = "Add variant to shopping cart")
    public ResponseEntity<ApiResponse<CartDto>> addItem(
            @Valid @RequestBody AddToCartRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(cartService.addItem(user.getId(), request), "Item added to cart"));
    }

    @PatchMapping("/items/{id}")
    @Operation(summary = "Update quantity of item in cart")
    public ResponseEntity<ApiResponse<CartDto>> updateQuantity(
            @PathVariable Long id,
            @RequestParam int quantity,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(cartService.updateItemQuantity(user.getId(), id, quantity), "Cart updated"));
    }

    @DeleteMapping("/items/{id}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(cartService.removeItem(user.getId(), id), "Item removed"));
    }

    @PostMapping("/apply-coupon")
    @Operation(summary = "Apply promotional coupon to cart")
    public ResponseEntity<ApiResponse<CartDto>> applyCoupon(
            @Valid @RequestBody ApplyCouponRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(cartService.applyCoupon(user.getId(), request.getCode()), "Coupon applied"));
    }
}
