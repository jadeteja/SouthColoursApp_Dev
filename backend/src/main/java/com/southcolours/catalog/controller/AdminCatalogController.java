package com.southcolours.catalog.controller;

import com.southcolours.catalog.dto.CategoryDto;
import com.southcolours.catalog.dto.CreateProductRequest;
import com.southcolours.catalog.dto.ProductDto;
import com.southcolours.catalog.service.CatalogService;
import com.southcolours.security.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Catalog Management", description = "Endpoints for managing products, categories, variants, and stock")
public class AdminCatalogController {

    private final CatalogService catalogService;

    @GetMapping("/products")
    @Operation(summary = "Admin product listing with full stock info")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getAdminProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getProducts(categoryId, search, "newest", page, size), "Admin products retrieved"));
    }

    @PostMapping("/products")
    @Operation(summary = "Create product with multi-variants (size, color, stock) and gallery images")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductDto created = catalogService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success(created, "Product created successfully"));
    }

    @PatchMapping("/products/{id}/status")
    @Operation(summary = "Toggle active / inactive status of product in store")
    public ResponseEntity<ApiResponse<Void>> toggleProductStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        catalogService.toggleProductStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success(null, "Product status updated"));
    }

    @GetMapping("/categories")
    @Operation(summary = "Admin category tree listing")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getAllCategoriesTree(), "Categories retrieved"));
    }
}
