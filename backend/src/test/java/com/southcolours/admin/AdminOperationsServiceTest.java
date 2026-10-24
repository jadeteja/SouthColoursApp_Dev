package com.southcolours.admin;

import com.southcolours.admin.dto.AdminDashboardDto;
import com.southcolours.admin.service.AdminOperationsService;
import com.southcolours.cart.repository.CouponRepository;
import com.southcolours.catalog.repository.BannerRepository;
import com.southcolours.catalog.repository.ProductRepository;
import com.southcolours.checkout.entity.Order;
import com.southcolours.checkout.repository.OrderRepository;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminOperationsServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CouponRepository couponRepository;
    @Mock
    private BannerRepository bannerRepository;

    @InjectMocks
    private AdminOperationsService adminOperationsService;

    @Test
    @DisplayName("Should return clean zero metrics when store has no orders or revenue yet")
    void shouldReturnZeroMetricsWhenStoreIsEmpty() {
        when(orderRepository.count()).thenReturn(0L);
        when(productRepository.count()).thenReturn(0L);
        when(userRepository.count()).thenReturn(0L);
        when(orderRepository.findAll()).thenReturn(Collections.emptyList());

        AdminDashboardDto metrics = adminOperationsService.getDashboardMetrics();

        assertNotNull(metrics);
        assertEquals(0L, metrics.getTotalOrders());
        assertEquals(BigDecimal.ZERO, metrics.getTotalSales());
        assertEquals(0L, metrics.getNewCustomers());
        assertEquals(0L, metrics.getTotalProducts());
        assertEquals(0L, metrics.getPendingOrders());
        assertTrue(metrics.getSalesOverview().isEmpty());
        assertTrue(metrics.getTopCategories().isEmpty());
    }

    @Test
    @DisplayName("Should correctly calculate real total sales, orders, and pending status")
    void shouldCalculateAccurateSalesAndPendingOrders() {
        when(orderRepository.count()).thenReturn(2L);
        when(productRepository.count()).thenReturn(8L);
        when(userRepository.count()).thenReturn(5L);

        Order order1 = Order.builder()
                .id(1L)
                .status("PENDING")
                .totalAmount(new BigDecimal("1499.00"))
                .build();

        Order order2 = Order.builder()
                .id(2L)
                .status("DELIVERED")
                .totalAmount(new BigDecimal("2999.00"))
                .build();

        when(orderRepository.findAll()).thenReturn(List.of(order1, order2));

        AdminDashboardDto metrics = adminOperationsService.getDashboardMetrics();

        assertNotNull(metrics);
        assertEquals(2L, metrics.getTotalOrders());
        assertEquals(new BigDecimal("4498.00"), metrics.getTotalSales());
        assertEquals(1L, metrics.getPendingOrders());
        assertEquals(5L, metrics.getNewCustomers());
        assertEquals(8L, metrics.getTotalProducts());
    }
}
