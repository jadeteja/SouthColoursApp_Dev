package com.southcolours.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrackingStepDto {
    private String statusKey;
    private String label;
    private String timestamp;
    private boolean completed;
    private boolean isCurrent;
}
