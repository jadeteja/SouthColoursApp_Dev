package com.southcolours.checkout;

import com.southcolours.cart.dto.CartDto;
import com.southcolours.cart.entity.Cart;
import com.southcolours.cart.service.CartService;
import com.southcolours.checkout.dto.CreateCheckoutOrderRequest;
import com.southcolours.checkout.repository.OrderRepository;
import com.southcolours.checkout.repository.PaymentRepository;
import com.southcolours.checkout.service.CheckoutService;
import com.southcolours.catalog.repository.ProductVariantRepository;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CheckoutServiceTest {

    @Mock
    private CartService cartService;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CheckoutService checkoutService;

    @Test
    @DisplayName("Should reject checkout initiation when cart is completely empty")
    void shouldThrowExceptionWhenCartIsEmpty() {
        Long userId = 1L;
        User user = User.builder().id(userId).email("user@southcolours.com").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        Cart cart = Cart.builder().id(10L).user(user).build();
        when(cartService.getOrCreateCart(userId)).thenReturn(cart);

        CartDto emptyCart = CartDto.builder().id(10L).items(Collections.emptyList()).build();
        when(cartService.calculateCart(10L)).thenReturn(emptyCart);

        CreateCheckoutOrderRequest request = new CreateCheckoutOrderRequest();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                checkoutService.initiateCheckout(userId, request)
        );

        assertTrue(ex.getMessage().contains("empty cart"));
    }

    @Test
    @DisplayName("Should reject checkout initiation when user does not exist")
    void shouldThrowExceptionWhenUserNotFound() {
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        CreateCheckoutOrderRequest request = new CreateCheckoutOrderRequest();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                checkoutService.initiateCheckout(userId, request)
        );

        assertTrue(ex.getMessage().contains("User not found"));
    }
}
