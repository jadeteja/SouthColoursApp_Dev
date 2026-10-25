package com.southcolours.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateProductRequest {
    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    private String brand = "Southcolours";
    private String fabric;
    private String careInstructions;
    private String ageGroup;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.01", message = "Base price must be greater than zero")
    private BigDecimal basePrice;

    @NotNull(message = "Discount price is required")
    @DecimalMin(value = "0.01", message = "Discount price must be greater than zero")
    private BigDecimal discountPrice;

    private Boolean isFeatured = false;
    private Boolean isNewArrival = false;
    private Boolean isActive = true;
    private String videoUrl;

    @NotEmpty(message = "At least one variant must be provided")
    private List<CreateVariantRequest> variants;

    @NotEmpty(message = "At least one image URL must be provided")
    private List<String> imageUrls;
}
