package com.southcolours.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantDto {
    private Long id;
    private Long productId;
    private String sku;
    private String size;
    private String colorName;
    private String colorHex;
    private BigDecimal priceOverride;
    private Integer stockQuantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private Boolean isActive;
}
