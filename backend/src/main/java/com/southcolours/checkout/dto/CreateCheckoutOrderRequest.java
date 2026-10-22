package com.southcolours.checkout.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCheckoutOrderRequest {
    @NotNull(message = "Delivery address ID is required")
    private Long addressId;

    @NotNull(message = "Payment method is required")
    private String paymentMethod; // RAZORPAY, COD
}
