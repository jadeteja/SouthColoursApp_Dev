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

    @PutMapping("/products/{id}")
    @Operation(summary = "Update product details, variants, and images")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody CreateProductRequest request
    ) {
        ProductDto updated = catalogService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Product updated successfully"));
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

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete product from store catalog")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        catalogService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }

    @GetMapping("/categories")
    @Operation(summary = "Admin category tree listing")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getAllCategoriesTree(), "Categories retrieved"));
    }

    @PostMapping("/categories/sync")
    @Operation(summary = "Batch save and sync categories and subcategories into database")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> syncCategories(
            @RequestBody List<com.southcolours.catalog.dto.SyncCategoryItemRequest> requests
    ) {
        List<CategoryDto> synced = catalogService.syncCategories(requests);
        return ResponseEntity.ok(ApiResponse.success(synced, "Categories saved to database successfully"));
    }
}
