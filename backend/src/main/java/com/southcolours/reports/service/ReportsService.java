package com.southcolours.reports.service;

import com.southcolours.checkout.entity.Order;
import com.southcolours.checkout.repository.OrderRepository;
import com.southcolours.reports.dto.ReportsSummaryDto;
import com.southcolours.reports.dto.SalesTrendPointDto;
import com.southcolours.reports.dto.TopSellingProductDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportsService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public ReportsSummaryDto getReportsSummary(String tab, String startDate, String endDate) {
        List<Order> orders = orderRepository.findAll();

        BigDecimal totalSales = orders.stream()
                .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalSales.compareTo(BigDecimal.ZERO) == 0) {
            totalSales = new BigDecimal("432890");
        }

        long count = orders.isEmpty() ? 542 : orders.size();
        BigDecimal avgOrderValue = totalSales.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);

        List<SalesTrendPointDto> trendPoints = List.of(
                SalesTrendPointDto.builder().dateLabel("1 May").amount(new BigDecimal("150000")).build(),
                SalesTrendPointDto.builder().dateLabel("8 May").amount(new BigDecimal("180000")).build(),
                SalesTrendPointDto.builder().dateLabel("15 May").amount(new BigDecimal("240000")).build(),
                SalesTrendPointDto.builder().dateLabel("22 May").amount(new BigDecimal("210000")).build(),
                SalesTrendPointDto.builder().dateLabel("31 May").amount(new BigDecimal("432890")).build()
        );

        List<TopSellingProductDto> topSellingProducts = List.of(
                TopSellingProductDto.builder().name("Pink Lehenga Set").unitsSold(120).revenue(new BigDecimal("299880")).barColor("#FF4081").build(),
                TopSellingProductDto.builder().name("Yellow Anarkali").unitsSold(98).revenue(new BigDecimal("186102")).barColor("#FFA726").build(),
                TopSellingProductDto.builder().name("Boy's Kurta Set").unitsSold(75).revenue(new BigDecimal("119925")).barColor("#29B6F6").build(),
                TopSellingProductDto.builder().name("Floral Dress").unitsSold(62).revenue(new BigDecimal("80538")).barColor("#66BB6A").build()
        );

        return ReportsSummaryDto.builder()
                .tab(tab != null ? tab : "Sales")
                .totalSales(totalSales)
                .totalOrders(count)
                .avgOrderValue(avgOrderValue.compareTo(BigDecimal.ZERO) > 0 ? avgOrderValue : new BigDecimal("798"))
                .newCustomers(320)
                .trendPoints(trendPoints)
                .topSellingProducts(topSellingProducts)
                .build();
    }
}
