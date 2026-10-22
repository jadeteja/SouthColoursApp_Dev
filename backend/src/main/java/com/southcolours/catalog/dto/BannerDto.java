package com.southcolours.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BannerDto {
    private Long id;
    private String title;
    private String imageUrl;
    private String targetType;
    private String targetId;
    private Integer displayOrder;
    private Boolean isActive;
}
