package com.southcolours.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SyncCategoryItemRequest {
    private Long id;
    private String name;
    private String slug;
    @Builder.Default
    private List<String> subcategories = new ArrayList<>();
}
