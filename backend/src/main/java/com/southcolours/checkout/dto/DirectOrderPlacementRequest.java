package com.southcolours.checkout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DirectOrderPlacementRequest {
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String paymentMethod; // e.g. "Cash on Delivery", "Razorpay (UPI)", "Razorpay (Card)"
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private List<DirectOrderItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DirectOrderItemDto {
        private Long productId;
        private String name;
        private String size;
        private BigDecimal price;
        private Integer quantity;
        private String imageUrl;
    }
}
