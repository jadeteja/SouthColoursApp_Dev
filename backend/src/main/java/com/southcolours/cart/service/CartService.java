package com.southcolours.cart.service;

import com.southcolours.cart.dto.*;
import com.southcolours.cart.entity.Cart;
import com.southcolours.cart.entity.CartItem;
import com.southcolours.cart.entity.Coupon;
import com.southcolours.cart.repository.CartItemRepository;
import com.southcolours.cart.repository.CartRepository;
import com.southcolours.cart.repository.CouponRepository;
import com.southcolours.catalog.entity.ProductImage;
import com.southcolours.catalog.entity.ProductVariant;
import com.southcolours.catalog.repository.ProductVariantRepository;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            return cartRepository.save(Cart.builder().user(user).items(new ArrayList<>()).build());
        });
    }

    @Transactional
    public CartDto addItem(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new IllegalArgumentException("Variant not found"));

        if (variant.getAvailableQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient inventory available");
        }

        CartItem item = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId())
                .orElseGet(() -> CartItem.builder().cart(cart).variant(variant).quantity(0).build());

        int newQty = item.getQuantity() + request.getQuantity();
        if (newQty > variant.getAvailableQuantity()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock (" + variant.getAvailableQuantity() + ")");
        }

        item.setQuantity(newQty);
        cartItemRepository.save(item);

        return calculateCart(cart.getId());
    }

    @Transactional
    public CartDto updateItemQuantity(Long userId, Long itemId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Unauthorized cart item operation");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            if (quantity > item.getVariant().getAvailableQuantity()) {
                throw new IllegalArgumentException("Requested quantity exceeds stock");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return calculateCart(cart.getId());
    }

    @Transactional
    public CartDto removeItem(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Unauthorized cart item access");
        }

        cartItemRepository.delete(item);
        return calculateCart(cart.getId());
    }

    @Transactional
    public CartDto applyCoupon(Long userId, String code) {
        Cart cart = getOrCreateCart(userId);
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive coupon code"));

        if (coupon.getEndDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Coupon has expired");
        }

        cart.setAppliedCouponCode(coupon.getCode());
        cartRepository.save(cart);

        return calculateCart(cart.getId());
    }

    @Transactional
    public CartDto calculateCart(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        BigDecimal subtotal = BigDecimal.ZERO;
        List<CartItemDto> itemDtos = new ArrayList<>();

        for (CartItem item : cart.getItems()) {
            BigDecimal unitPrice = item.getVariant().getPriceOverride() != null
                    ? item.getVariant().getPriceOverride()
                    : item.getVariant().getProduct().getDiscountPrice();

            BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(total);

            String imgUrl = item.getVariant().getProduct().getImages().stream()
                    .filter(ProductImage::getIsPrimary)
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(item.getVariant().getProduct().getImages().isEmpty() ? null : item.getVariant().getProduct().getImages().get(0).getImageUrl());

            itemDtos.add(CartItemDto.builder()
                    .id(item.getId())
                    .variantId(item.getVariant().getId())
                    .productId(item.getVariant().getProduct().getId())
                    .productName(item.getVariant().getProduct().getName())
                    .imageUrl(imgUrl)
                    .sku(item.getVariant().getSku())
                    .size(item.getVariant().getSize())
                    .color(item.getVariant().getColorName())
                    .availableStock(item.getVariant().getAvailableQuantity())
                    .quantity(item.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(total)
                    .build());
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (cart.getAppliedCouponCode() != null) {
            Coupon coupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(cart.getAppliedCouponCode()).orElse(null);
            if (coupon != null && subtotal.compareTo(coupon.getMinOrderAmount()) >= 0) {
                if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                    discount = subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                        discount = coupon.getMaxDiscountAmount();
                    }
                } else {
                    discount = coupon.getDiscountValue();
                }
            }
        }

        BigDecimal shipping = subtotal.compareTo(new BigDecimal("1500")) >= 0 || subtotal.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : new BigDecimal("99");

        BigDecimal grandTotal = subtotal.subtract(discount).add(shipping).max(BigDecimal.ZERO);

        return CartDto.builder()
                .id(cart.getId())
                .items(itemDtos)
                .subtotal(subtotal)
                .discount(discount)
                .shippingFee(shipping)
                .tax(BigDecimal.ZERO)
                .grandTotal(grandTotal)
                .appliedCouponCode(cart.getAppliedCouponCode())
                .build();
    }
}
