package com.southcolours.orders.service;

import com.southcolours.checkout.entity.Order;
import com.southcolours.checkout.entity.OrderItem;
import com.southcolours.checkout.entity.Payment;
import com.southcolours.checkout.repository.OrderRepository;
import com.southcolours.orders.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Transactional(readOnly = true)
    public List<OrderDto> getUserOrders(Long userId, String statusFilter) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (statusFilter != null && !statusFilter.equalsIgnoreCase("All")) {
            orders = orders.stream()
                    .filter(o -> o.getStatus().equalsIgnoreCase(statusFilter))
                    .collect(Collectors.toList());
        }
        return orders.stream().map(this::mapToOrderDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderNumber));
        return mapToOrderDto(order);
    }

    @Transactional(readOnly = true)
    public TrackingTimelineDto getOrderTracking(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderNumber));

        List<TrackingStepDto> steps = new ArrayList<>();
        String status = order.getStatus();

        steps.add(TrackingStepDto.builder()
                .statusKey("PLACED")
                .label("Order Placed")
                .timestamp(order.getCreatedAt() != null ? order.getCreatedAt().format(FORMATTER) : "12 May, 10:00 AM")
                .completed(true)
                .isCurrent("PENDING".equalsIgnoreCase(status))
                .build());

        steps.add(TrackingStepDto.builder()
                .statusKey("PROCESSING")
                .label("Processing")
                .timestamp("12 May, 02:00 PM")
                .completed(isAfterOrEqual(status, "PROCESSING"))
                .isCurrent("PROCESSING".equalsIgnoreCase(status))
                .build());

        steps.add(TrackingStepDto.builder()
                .statusKey("SHIPPED")
                .label("Shipped")
                .timestamp("13 May, 11:00 AM")
                .completed(isAfterOrEqual(status, "SHIPPED"))
                .isCurrent("SHIPPED".equalsIgnoreCase(status))
                .build());

        steps.add(TrackingStepDto.builder()
                .statusKey("OUT_FOR_DELIVERY")
                .label("Out for Delivery")
                .timestamp("Pending")
                .completed(isAfterOrEqual(status, "OUT_FOR_DELIVERY"))
                .isCurrent("OUT_FOR_DELIVERY".equalsIgnoreCase(status))
                .build());

        steps.add(TrackingStepDto.builder()
                .statusKey("DELIVERED")
                .label("Delivered")
                .timestamp("Expected 15 May")
                .completed(isAfterOrEqual(status, "DELIVERED"))
                .isCurrent("DELIVERED".equalsIgnoreCase(status))
                .build());

        return TrackingTimelineDto.builder()
                .orderNumber(order.getOrderNumber())
                .currentStatus(order.getStatus())
                .courierName("Delhivery")
                .trackingNumber("DL1234567890")
                .estimatedDelivery("15 May 2024")
                .steps(steps)
                .deliveryAddress("Priya Sharma, 123, Green Park, Bangalore - 560001")
                .build();
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(newStatus.toUpperCase());
        return mapToOrderDto(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllAdminOrders(String statusFilter) {
        List<Order> orders = orderRepository.findAll();
        if (statusFilter != null && !statusFilter.equalsIgnoreCase("All")) {
            orders = orders.stream()
                    .filter(o -> o.getStatus().equalsIgnoreCase(statusFilter))
                    .collect(Collectors.toList());
        }
        return orders.stream().map(this::mapToOrderDto).collect(Collectors.toList());
    }

    private boolean isAfterOrEqual(String currentStatus, String targetStep) {
        List<String> pipeline = List.of("PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED");
        int currentIdx = pipeline.indexOf(currentStatus.toUpperCase());
        int targetIdx = pipeline.indexOf(targetStep.toUpperCase());
        return currentIdx >= targetIdx && currentIdx != -1;
    }

    public OrderDto mapToOrderDto(Order order) {
        String paymentStatus = order.getPayments().stream()
                .map(Payment::getStatus)
                .findFirst()
                .orElse("PENDING");

        String paymentMethod = order.getPayments().stream()
                .map(Payment::getPaymentMethod)
                .findFirst()
                .orElse("RAZORPAY");

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .status(order.getStatus())
                .paymentStatus(paymentStatus)
                .paymentMethod(paymentMethod)
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt() != null ? order.getCreatedAt().format(FORMATTER) : "12 May 2024")
                .shippingAddressJson(order.getShippingAddressSnapshot())
                .trackingNumber("DL1234567890")
                .courierName("Delhivery")
                .items(order.getItems().stream().map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .variantId(item.getVariant().getId())
                        .productName(item.getProductName())
                        .variantSku(item.getVariantSku())
                        .size(item.getSize())
                        .color(item.getColor())
                        .imageUrl(item.getImageUrl())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
