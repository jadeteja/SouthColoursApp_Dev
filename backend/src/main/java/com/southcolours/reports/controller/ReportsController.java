package com.southcolours.reports.controller;

import com.southcolours.reports.dto.ReportsSummaryDto;
import com.southcolours.reports.service.ReportsService;
import com.southcolours.security.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Admin Reports & Analytics", description = "Endpoints for aggregated business reporting, sales trends, and product rankings")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping
    @Operation(summary = "Get aggregated analytics report by tab (Sales, Orders, Customers, Products)")
    public ResponseEntity<ApiResponse<ReportsSummaryDto>> getReports(
            @RequestParam(required = false, defaultValue = "Sales") String tab,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        return ResponseEntity.ok(ApiResponse.success(reportsService.getReportsSummary(tab, startDate, endDate), "Reports data retrieved"));
    }
}
