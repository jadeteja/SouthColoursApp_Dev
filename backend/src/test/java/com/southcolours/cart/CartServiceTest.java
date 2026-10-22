package com.southcolours.cart;

import com.southcolours.cart.dto.AddToCartRequest;
import com.southcolours.cart.dto.CartDto;
import com.southcolours.cart.entity.Cart;
import com.southcolours.cart.entity.Coupon;
import com.southcolours.cart.repository.CartItemRepository;
import com.southcolours.cart.repository.CartRepository;
import com.southcolours.cart.repository.CouponRepository;
import com.southcolours.cart.service.CartService;
import com.southcolours.catalog.entity.Product;
import com.southcolours.catalog.entity.ProductVariant;
import com.southcolours.catalog.repository.ProductVariantRepository;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CartServiceTest {

    @Mock
    private CartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private CouponRepository couponRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    private User user;
    private Cart cart;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@example.com").fullName("Priya").build();
        cart = Cart.builder().id(10L).user(user).items(new ArrayList<>()).build();

        Product product = Product.builder()
                .id(100L)
                .name("Pink Lehenga Set")
                .discountPrice(new BigDecimal("2499"))
                .images(new ArrayList<>())
                .build();

        variant = ProductVariant.builder()
                .id(50L)
                .product(product)
                .sku("SC-LHG-PNK-1")
                .stockQuantity(10)
                .reservedQuantity(0)
                .build();
    }

    @Test
    @DisplayName("Should prevent adding item if requested quantity exceeds available stock")
    void addItem_ExceedsStock_ThrowsException() {
        AddToCartRequest req = new AddToCartRequest();
        req.setVariantId(50L);
        req.setQuantity(15); // Exceeds stock (10)

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(variantRepository.findById(50L)).thenReturn(Optional.of(variant));

        assertThrows(IllegalArgumentException.class, () -> cartService.addItem(1L, req));
    }
}
