package com.southcolours.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateVariantRequest {
    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Size is required")
    private String size;

    @NotBlank(message = "Color name is required")
    private String colorName;

    private String colorHex;
    private BigDecimal priceOverride;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stockQuantity;
}
