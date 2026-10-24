package com.southcolours.checkout.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.southcolours.cart.dto.CartDto;
import com.southcolours.cart.dto.CartItemDto;
import com.southcolours.cart.entity.Cart;
import com.southcolours.cart.repository.CartRepository;
import com.southcolours.cart.service.CartService;
import com.southcolours.catalog.entity.ProductVariant;
import com.southcolours.catalog.repository.ProductVariantRepository;
import com.southcolours.checkout.dto.CreateCheckoutOrderRequest;
import com.southcolours.checkout.dto.RazorpayVerifyRequest;
import com.southcolours.checkout.entity.Order;
import com.southcolours.checkout.entity.OrderItem;
import com.southcolours.checkout.entity.Payment;
import com.southcolours.checkout.repository.OrderRepository;
import com.southcolours.checkout.repository.PaymentRepository;
import com.southcolours.admin.service.AdminOperationsService;
import com.southcolours.notification.service.WhatsAppNotificationService;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final CartService cartService;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final AdminOperationsService adminOperationsService;
    private final WhatsAppNotificationService whatsAppNotificationService;

    @Value("${app.razorpay.key-id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret:razorpay_secret_placeholder}")
    private String razorpayKeySecret;

    @Transactional
    public Map<String, Object> initiateCheckout(Long userId, CreateCheckoutOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Cart cart = cartService.getOrCreateCart(userId);
        CartDto cartDto = cartService.calculateCart(cart.getId());

        if (cartDto.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot checkout with an empty cart");
        }

        // 1. Transaction-safe inventory stock reservation
        for (CartItemDto item : cartDto.getItems()) {
            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Variant not found: " + item.getVariantId()));

            if (variant.getAvailableQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient inventory for: " + item.getProductName());
            }

            variant.setReservedQuantity(variant.getReservedQuantity() + item.getQuantity());
            variantRepository.save(variant);
        }

        // 2. Create internal Order
        String orderNumber = "SC" + System.currentTimeMillis();
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .status("PENDING")
                .subtotal(cartDto.getSubtotal())
                .discountAmount(cartDto.getDiscount())
                .shippingFee(cartDto.getShippingFee())
                .taxAmount(cartDto.getTax())
                .totalAmount(cartDto.getGrandTotal())
                .shippingAddressSnapshot("{\"addressId\": " + request.getAddressId() + ", \"fullName\": \"" + user.getFullName() + "\"}")
                .build();

        for (CartItemDto itemDto : cartDto.getItems()) {
            ProductVariant variant = variantRepository.getReferenceById(itemDto.getVariantId());
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .productName(itemDto.getProductName())
                    .variantSku(itemDto.getSku())
                    .size(itemDto.getSize())
                    .color(itemDto.getColor())
                    .imageUrl(itemDto.getImageUrl())
                    .unitPrice(itemDto.getUnitPrice())
                    .quantity(itemDto.getQuantity())
                    .totalPrice(itemDto.getTotalPrice())
                    .build();
            order.getItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // 3. Create Razorpay Order
        String razorpayOrderId = "order_mock_" + UUID.randomUUID().toString().substring(0, 8);
        try {
            if (!razorpayKeyId.contains("placeholder")) {
                RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                JSONObject orderReq = new JSONObject();
                // minor units (paise)
                orderReq.put("amount", cartDto.getGrandTotal().multiply(BigDecimal.valueOf(100)).intValue());
                orderReq.put("currency", "INR");
                orderReq.put("receipt", orderNumber);
                com.razorpay.Order rzpOrder = client.orders.create(orderReq);
                razorpayOrderId = rzpOrder.get("id");
            }
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
        }

        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(request.getPaymentMethod())
                .gatewayName("RAZORPAY")
                .razorpayOrderId(razorpayOrderId)
                .amount(cartDto.getGrandTotal())
                .status("CREATED")
                .build();
        paymentRepository.save(payment);

        Map<String, Object> result = new HashMap<>();
        result.put("orderNumber", orderNumber);
        result.put("razorpayOrderId", razorpayOrderId);
        result.put("amount", cartDto.getGrandTotal());
        result.put("currency", "INR");
        result.put("keyId", razorpayKeyId);

        return result;
    }

    @Transactional
    public boolean verifyRazorpayPayment(RazorpayVerifyRequest request) {
        Order order = orderRepository.findByOrderNumber(request.getOrderNumber())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + request.getOrderNumber()));

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

        boolean isValidSignature = true;
        try {
            if (!razorpayKeySecret.contains("placeholder")) {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", request.getRazorpayOrderId());
                options.put("razorpay_payment_id", request.getRazorpayPaymentId());
                options.put("razorpay_signature", request.getRazorpaySignature());
                isValidSignature = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            }
        } catch (Exception e) {
            isValidSignature = false;
        }

        if (!isValidSignature) {
            payment.setStatus("FAILED");
            payment.setFailureReason("Signature mismatch verification failed");
            paymentRepository.save(payment);
            return false;
        }

        // Finalize Payment & Order
        payment.setStatus("CAPTURED");
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        paymentRepository.save(payment);

        order.setStatus("CONFIRMED");
        orderRepository.save(order);

        // Deduct inventory from reserved to permanent
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            variant.setStockQuantity(Math.max(0, variant.getStockQuantity() - item.getQuantity()));
            variant.setReservedQuantity(Math.max(0, variant.getReservedQuantity() - item.getQuantity()));
            variantRepository.save(variant);
        }

        // Clear shopping cart
        Cart cart = cartService.getOrCreateCart(order.getUser().getId());
        cart.getItems().clear();
        cart.setAppliedCouponCode(null);
        cartRepository.save(cart);

        // Send automated WhatsApp notification if enabled
        if (adminOperationsService != null && adminOperationsService.isWhatsappEnabled()) {
            try {
                String customerPhone = order.getUser() != null ? order.getUser().getPhoneNumber() : null;
                whatsAppNotificationService.sendOrderPlacedMessage(
                        customerPhone,
                        order.getUser() != null ? order.getUser().getFullName() : "Customer",
                        order.getOrderNumber(),
                        order.getTotalAmount() != null ? order.getTotalAmount().toString() : "0",
                        adminOperationsService.getWhatsappAdminPhone(),
                        adminOperationsService.getWhatsappTemplate(),
                        adminOperationsService.getWhatsappPhoneNumberId(),
                        adminOperationsService.getWhatsappAccessToken()
                );
            } catch (Exception e) {
                log.error("Failed to process WhatsApp notification trigger for order {}: {}", order.getOrderNumber(), e.getMessage());
            }
        }

        return true;
    }
}
