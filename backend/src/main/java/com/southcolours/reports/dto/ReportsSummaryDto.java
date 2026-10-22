package com.southcolours.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportsSummaryDto {
    private String tab; // Sales, Orders, Customers, Products
    private BigDecimal totalSales;
    private long totalOrders;
    private BigDecimal avgOrderValue;
    private long newCustomers;
    private List<SalesTrendPointDto> trendPoints;
    private List<TopSellingProductDto> topSellingProducts;
}
