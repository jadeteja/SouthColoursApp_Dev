package com.southcolours.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductImageDto {
    private Long id;
    private String imageUrl;
    private Integer displayOrder;
    private Boolean isPrimary;
}
