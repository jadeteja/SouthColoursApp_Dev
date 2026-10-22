package com.southcolours.catalog.controller;

import com.southcolours.catalog.dto.CategoryDto;
import com.southcolours.catalog.dto.HomeFeedDto;
import com.southcolours.catalog.dto.ProductDto;
import com.southcolours.catalog.service.CatalogService;
import com.southcolours.security.dto.ApiResponse;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Customer Catalog", description = "Endpoints for Home feed, categories, products, and wishlist")
public class CatalogController {

    private final CatalogService catalogService;
    private final UserRepository userRepository;

    @GetMapping("/home-feed")
    @Operation(summary = "Get aggregated homepage content (banners, circular categories, featured, new arrivals)")
    public ResponseEntity<ApiResponse<HomeFeedDto>> getHomeFeed() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getHomeFeed(), "Home feed retrieved"));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get full hierarchical category tree")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getAllCategoriesTree(), "Categories retrieved"));
    }

    @GetMapping("/products")
    @Operation(summary = "Get paginated, filtered, and sorted products")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getProducts(categoryId, search, sortBy, page, size), "Products retrieved"));
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get complete product details including variants, sizes, colors, and image gallery")
    public ResponseEntity<ApiResponse<ProductDto>> getProductDetails(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getProductDetails(id), "Product details retrieved"));
    }

    @PostMapping("/wishlist/{productId}")
    @Operation(summary = "Toggle product in customer's wishlist")
    public ResponseEntity<ApiResponse<Void>> toggleWishlist(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        catalogService.toggleWishlist(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success(null, "Wishlist updated"));
    }

    @GetMapping("/wishlist")
    @Operation(summary = "Get customer's wishlist products")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getWishlist(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(catalogService.getUserWishlist(user.getId()), "Wishlist items retrieved"));
    }
}
