package com.southcolours.orders.controller;

import com.southcolours.orders.dto.OrderDto;
import com.southcolours.orders.dto.TrackingTimelineDto;
import com.southcolours.orders.service.OrderService;
import com.southcolours.security.dto.ApiResponse;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Customer Orders", description = "Endpoints for Customer Order History and Live Shipment Tracking")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get current authenticated customer order history")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getCustomerOrders(
            @RequestParam(required = false, defaultValue = "All") String status,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(user.getId(), status), "Orders retrieved"));
    }

    @GetMapping("/{orderNumber}")
    @Operation(summary = "Get detailed order information by order number")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderDetails(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderByNumber(orderNumber), "Order details retrieved"));
    }

    @GetMapping("/{orderNumber}/tracking")
    @Operation(summary = "Get vertical milestone tracking timeline for an order")
    public ResponseEntity<ApiResponse<TrackingTimelineDto>> getTrackingTimeline(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderTracking(orderNumber), "Tracking timeline retrieved"));
    }
}
