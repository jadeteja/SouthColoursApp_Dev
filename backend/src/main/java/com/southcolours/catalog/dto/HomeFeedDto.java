package com.southcolours.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HomeFeedDto {
    private List<BannerDto> banners;
    private List<CategoryDto> categories;
    private List<ProductDto> featuredProducts;
    private List<ProductDto> newArrivals;
}
