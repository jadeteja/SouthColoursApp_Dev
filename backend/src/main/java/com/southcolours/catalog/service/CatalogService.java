package com.southcolours.catalog.service;

import com.southcolours.catalog.dto.*;
import com.southcolours.catalog.entity.*;
import com.southcolours.catalog.repository.*;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CatalogService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final BannerRepository bannerRepository;
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public HomeFeedDto getHomeFeed() {
        List<BannerDto> banners = bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToBannerDto)
                .collect(Collectors.toList());

        List<CategoryDto> categories = categoryRepository.findByParentIsNullAndIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToCategoryDto)
                .collect(Collectors.toList());

        List<ProductDto> featured = productRepository.findTopFeatured(PageRequest.of(0, 10)).stream()
                .map(this::mapToProductDto)
                .collect(Collectors.toList());

        List<ProductDto> newArrivals = productRepository.findTopNewArrivals(PageRequest.of(0, 10)).stream()
                .map(this::mapToProductDto)
                .collect(Collectors.toList());

        return HomeFeedDto.builder()
                .banners(banners)
                .categories(categories)
                .featuredProducts(featured)
                .newArrivals(newArrivals)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategoriesTree() {
        return categoryRepository.findByParentIsNullAndIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToCategoryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProducts(Long categoryId, String search, String sortBy, int page, int size) {
        Sort sort = Sort.by("createdAt").descending();
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("discountPrice").ascending();
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("discountPrice").descending();
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        if (categoryId != null) {
            return productRepository.findByCategoryIdOrParentId(categoryId, pageable)
                    .map(this::mapToProductDto);
        }

        return productRepository.findAll(pageable).map(this::mapToProductDto);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductDetails(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        return mapToProductDto(product);
    }

    @Transactional
    public ProductDto createProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid category id"));

        String slug = toSlug(request.getName()) + "-" + UUID.randomUUID().toString().substring(0, 6);

        Product product = Product.builder()
                .category(category)
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .brand(request.getBrand() != null ? request.getBrand() : "Southcolours")
                .fabric(request.getFabric())
                .careInstructions(request.getCareInstructions())
                .ageGroup(request.getAgeGroup())
                .basePrice(request.getBasePrice())
                .discountPrice(request.getDiscountPrice())
                .isFeatured(Boolean.TRUE.equals(request.getIsFeatured()))
                .isNewArrival(Boolean.TRUE.equals(request.getIsNewArrival()))
                .isActive(Boolean.TRUE.equals(request.getIsActive()))
                .build();

        // Add variants
        if (request.getVariants() != null) {
            for (CreateVariantRequest vReq : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(vReq.getSku())
                        .size(vReq.getSize())
                        .colorName(vReq.getColorName())
                        .colorHex(vReq.getColorHex())
                        .priceOverride(vReq.getPriceOverride())
                        .stockQuantity(vReq.getStockQuantity())
                        .reservedQuantity(0)
                        .isActive(true)
                        .build();
                product.getVariants().add(variant);
            }
        }

        // Add images
        if (request.getImageUrls() != null) {
            int order = 0;
            for (String imgUrl : request.getImageUrls()) {
                ProductImage img = ProductImage.builder()
                        .product(product)
                        .imageUrl(imgUrl)
                        .displayOrder(order)
                        .isPrimary(order == 0)
                        .build();
                product.getImages().add(img);
                order++;
            }
        }

        Product saved = productRepository.save(product);
        return mapToProductDto(saved);
    }

    @Transactional
    public void toggleProductStatus(Long productId, boolean active) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        product.setIsActive(active);
        productRepository.save(product);
    }

    @Transactional
    public void toggleWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
        } else {
            wishlistRepository.save(Wishlist.builder().user(user).product(product).build());
        }
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(w -> mapToProductDto(w.getProduct()))
                .collect(Collectors.toList());
    }

    // Mapping helper methods
    public ProductDto mapToProductDto(Product product) {
        int discountPct = 0;
        if (product.getBasePrice() != null && product.getBasePrice().compareTo(BigDecimal.ZERO) > 0
                && product.getDiscountPrice() != null) {
            BigDecimal diff = product.getBasePrice().subtract(product.getDiscountPrice());
            discountPct = diff.divide(product.getBasePrice(), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).intValue();
        }

        String primaryImg = product.getImages().stream()
                .filter(ProductImage::getIsPrimary)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl());

        return ProductDto.builder()
                .id(product.getId())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .brand(product.getBrand())
                .fabric(product.getFabric())
                .careInstructions(product.getCareInstructions())
                .ageGroup(product.getAgeGroup())
                .basePrice(product.getBasePrice())
                .discountPrice(product.getDiscountPrice())
                .discountPercentage(discountPct)
                .averageRating(4.8) // Aggregate or default
                .reviewCount(24)
                .isActive(product.getIsActive())
                .isFeatured(product.getIsFeatured())
                .isNewArrival(product.getIsNewArrival())
                .primaryImageUrl(primaryImg)
                .images(product.getImages().stream().map(img -> ProductImageDto.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .displayOrder(img.getDisplayOrder())
                        .isPrimary(img.getIsPrimary())
                        .build()).collect(Collectors.toList()))
                .variants(product.getVariants().stream().map(v -> ProductVariantDto.builder()
                        .id(v.getId())
                        .productId(product.getId())
                        .sku(v.getSku())
                        .size(v.getSize())
                        .colorName(v.getColorName())
                        .colorHex(v.getColorHex())
                        .priceOverride(v.getPriceOverride())
                        .stockQuantity(v.getStockQuantity())
                        .reservedQuantity(v.getReservedQuantity())
                        .availableQuantity(v.getAvailableQuantity())
                        .isActive(v.getIsActive())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    public CategoryDto mapToCategoryDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .displayOrder(category.getDisplayOrder())
                .isActive(category.getIsActive())
                .subcategories(category.getSubcategories().stream().map(this::mapToCategoryDto).collect(Collectors.toList()))
                .build();
    }

    public BannerDto mapToBannerDto(Banner banner) {
        return BannerDto.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .imageUrl(banner.getImageUrl())
                .targetType(banner.getTargetType())
                .targetId(banner.getTargetId())
                .displayOrder(banner.getDisplayOrder())
                .isActive(banner.getIsActive())
                .build();
    }

    private String toSlug(String input) {
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        return normalized.replaceAll("[^\\w-]", "").toLowerCase();
    }
}
