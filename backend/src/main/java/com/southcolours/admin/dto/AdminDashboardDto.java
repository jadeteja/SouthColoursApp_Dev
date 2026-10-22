package com.southcolours.admin.dto;

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
public class AdminDashboardDto {
    private long totalOrders;
    private BigDecimal totalSales;
    private long newCustomers;
    private long totalProducts;
    private long pendingOrders;
    private long lowStockProducts;
    private List<SalesChartPointDto> salesOverview;
    private List<CategorySalesShareDto> topCategories;
}
