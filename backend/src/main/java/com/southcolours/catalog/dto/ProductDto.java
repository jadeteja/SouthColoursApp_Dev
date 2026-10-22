package com.southcolours.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String slug;
    private String description;
    private String brand;
    private String fabric;
    private String careInstructions;
    private String ageGroup;
    private BigDecimal basePrice;
    private BigDecimal discountPrice;
    private Integer discountPercentage;
    private Double averageRating;
    private Integer reviewCount;
    private Boolean isActive;
    private Boolean isFeatured;
    private Boolean isNewArrival;
    private String primaryImageUrl;
    private List<ProductImageDto> images;
    private List<ProductVariantDto> variants;
}
