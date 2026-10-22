package com.southcolours.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerSummaryDto {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private int orderCount;
    private BigDecimal totalSpent;
    private String registeredDate;
    private Boolean isActive;
}
