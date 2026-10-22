package com.southcolours.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDto {
    private Long id;
    private Long variantId;
    private Long productId;
    private String productName;
    private String imageUrl;
    private String sku;
    private String size;
    private String color;
    private Integer availableStock;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
