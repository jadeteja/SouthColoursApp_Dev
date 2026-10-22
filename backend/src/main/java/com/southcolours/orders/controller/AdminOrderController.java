package com.southcolours.orders.controller;

import com.southcolours.orders.dto.OrderDto;
import com.southcolours.orders.service.OrderService;
import com.southcolours.security.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Order Operations", description = "Endpoints for Admin Order Fulfillment, Status Updates, and Details")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Get store orders with optional status filter")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getStoreOrders(
            @RequestParam(required = false, defaultValue = "All") String status
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllAdminOrders(status), "Admin orders retrieved"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order fulfillment status (PROCESSING, SHIPPED, DELIVERED, CANCELLED)")
    public ResponseEntity<ApiResponse<OrderDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.updateOrderStatus(id, status), "Order status updated successfully"));
    }
}
