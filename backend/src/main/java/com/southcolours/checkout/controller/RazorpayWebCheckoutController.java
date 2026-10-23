package com.southcolours.checkout.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payment-gateway")
public class RazorpayWebCheckoutController {

    private final com.southcolours.admin.service.AdminOperationsService adminService;

    public RazorpayWebCheckoutController(com.southcolours.admin.service.AdminOperationsService adminService) {
        this.adminService = adminService;
    }

    @GetMapping(value = "/pay", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> renderRazorpayCheckoutPage(
            @RequestParam(name = "amount", defaultValue = "100") Double amount,
            @RequestParam(name = "orderNumber", defaultValue = "SC_ORDER") String orderNumber,
            @RequestParam(name = "name", defaultValue = "Customer") String customerName,
            @RequestParam(name = "phone", defaultValue = "+91 9876543210") String phone,
            @RequestParam(name = "keyId", required = false) String customKeyId
    ) {
        String key = (customKeyId != null && !customKeyId.isEmpty() && !customKeyId.contains("placeholder"))
                ? customKeyId
                : adminService.getEffectiveRazorpayKeyId();

        int amountInPaise = (int) Math.round(amount * 100);

        String html = "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>Southcolours - Razorpay Payment</title>\n" +
                "    <script src=\"https://checkout.razorpay.com/v1/checkout.js\"></script>\n" +
                "    <style>\n" +
                "        body {\n" +
                "            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\n" +
                "            background: linear-gradient(135deg, #FFF0F5 0%, #FFFFFF 100%);\n" +
                "            margin: 0;\n" +
                "            padding: 24px;\n" +
                "            display: flex;\n" +
                "            align-items: center;\n" +
                "            justify-content: center;\n" +
                "            min-height: 85vh;\n" +
                "            color: #1e293b;\n" +
                "        }\n" +
                "        .card {\n" +
                "            background: #ffffff;\n" +
                "            border-radius: 20px;\n" +
                "            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);\n" +
                "            padding: 30px;\n" +
                "            max-width: 420px;\n" +
                "            width: 100%;\n" +
                "            text-align: center;\n" +
                "            border: 1px solid #fce7f3;\n" +
                "        }\n" +
                "        .logo-badge {\n" +
                "            font-size: 38px;\n" +
                "            margin-bottom: 8px;\n" +
                "        }\n" +
                "        h2 {\n" +
                "            margin: 0 0 6px 0;\n" +
                "            color: #be185d;\n" +
                "            font-size: 22px;\n" +
                "        }\n" +
                "        .order-tag {\n" +
                "            font-size: 13px;\n" +
                "            color: #64748b;\n" +
                "            margin-bottom: 20px;\n" +
                "        }\n" +
                "        .amount-box {\n" +
                "            background: #fdf2f8;\n" +
                "            border: 1.5px dashed #f472b6;\n" +
                "            border-radius: 12px;\n" +
                "            padding: 16px;\n" +
                "            margin-bottom: 24px;\n" +
                "        }\n" +
                "        .amount-label {\n" +
                "            font-size: 12px;\n" +
                "            color: #9d174d;\n" +
                "            font-weight: 600;\n" +
                "            text-transform: uppercase;\n" +
                "        }\n" +
                "        .amount-val {\n" +
                "            font-size: 32px;\n" +
                "            font-weight: 800;\n" +
                "            color: #831843;\n" +
                "            margin-top: 4px;\n" +
                "        }\n" +
                "        .btn-pay {\n" +
                "            background: #0284c7;\n" +
                "            color: white;\n" +
                "            border: none;\n" +
                "            width: 100%;\n" +
                "            padding: 16px;\n" +
                "            border-radius: 12px;\n" +
                "            font-size: 16px;\n" +
                "            font-weight: 700;\n" +
                "            cursor: pointer;\n" +
                "            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);\n" +
                "            transition: all 0.2s ease;\n" +
                "        }\n" +
                "        .btn-pay:hover {\n" +
                "            background: #0369a1;\n" +
                "            transform: translateY(-1px);\n" +
                "        }\n" +
                "        .security-footer {\n" +
                "            margin-top: 18px;\n" +
                "            font-size: 12px;\n" +
                "            color: #64748b;\n" +
                "            display: flex;\n" +
                "            align-items: center;\n" +
                "            justify-content: center;\n" +
                "            gap: 6px;\n" +
                "        }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"card\">\n" +
                "        <div class=\"logo-badge\">🌸</div>\n" +
                "        <h2>Southcolours Traditional</h2>\n" +
                "        <div class=\"order-tag\">Order Reference: <strong>" + orderNumber + "</strong></div>\n" +
                "        <div class=\"amount-box\">\n" +
                "            <div class=\"amount-label\">Total Payable Amount</div>\n" +
                "            <div class=\"amount-val\">₹" + amount + "</div>\n" +
                "        </div>\n" +
                "        <button id=\"rzp-button\" class=\"btn-pay\">Pay with Razorpay</button>\n" +
                "        <div class=\"security-footer\">\n" +
                "            <span>🔒 Secured by Razorpay 256-bit Encryption</span>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "    <script>\n" +
                "        const options = {\n" +
                "            key: '" + key + "',\n" +
                "            amount: '" + amountInPaise + "',\n" +
                "            currency: 'INR',\n" +
                "            name: 'Southcolours Traditional Wear',\n" +
                "            description: 'Payment for Order " + orderNumber + "',\n" +
                "            image: 'https://cdn.iconscout.com/icon/free/png-256/free-razorpay-logo-icon-download-in-svg-png-gif-file-formats--payment-gateway-brand-social-media-pack-logos-icons-6604631.png',\n" +
                "            prefill: {\n" +
                "                name: '" + customerName + "',\n" +
                "                contact: '" + phone + "'\n" +
                "            },\n" +
                "            theme: {\n" +
                "                color: '#E11D48'\n" +
                "            },\n" +
                "            handler: function (response) {\n" +
                "                alert('Payment Successful! Payment ID: ' + response.razorpay_payment_id);\n" +
                "                window.location.href = 'southcolours://order-confirmation?orderNumber=" + orderNumber + "&orderAmount=" + amount + "&transactionId=' + response.razorpay_payment_id;\n" +
                "            },\n" +
                "            modal: {\n" +
                "                ondismiss: function() {\n" +
                "                    console.log('Checkout dismissed by user');\n" +
                "                }\n" +
                "            }\n" +
                "        };\n" +
                "        const rzp = new Razorpay(options);\n" +
                "        document.getElementById('rzp-button').onclick = function(e){\n" +
                "            rzp.open();\n" +
                "            e.preventDefault();\n" +
                "        };\n" +
                "        window.onload = function() {\n" +
                "            setTimeout(function() {\n" +
                "                rzp.open();\n" +
                "            }, 500);\n" +
                "        };\n" +
                "    </script>\n" +
                "</body>\n" +
                "</html>";

        return ResponseEntity.ok(html);
    }
}
