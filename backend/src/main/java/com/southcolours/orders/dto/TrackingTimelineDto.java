package com.southcolours.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrackingTimelineDto {
    private String orderNumber;
    private String currentStatus;
    private String courierName;
    private String trackingNumber;
    private String estimatedDelivery;
    private List<TrackingStepDto> steps;
    private String deliveryAddress;
}
