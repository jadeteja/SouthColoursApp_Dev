import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { API_BASE_URL } from '../../src/config/api';
import { useAdminAuthStore } from '../../src/stores/adminAuthStore';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

interface OrderItemData {
  id?: number;
  productName: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  totalPrice?: number;
  imageUrl?: string;
}

interface OrderData {
  id: number;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt?: string;
  status: string;
  subtotal?: number;
  discountAmount?: number;
  shippingFee?: number;
  taxAmount?: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddressJson?: string;
  items?: OrderItemData[];
}

export default function AdminOrderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.id ? String(params.id) : null;

  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [status, setStatus] = useState('Delivered');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      const token = useAdminAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token && token !== 'mock_admin_token') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, { headers });
      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data);
        setStatus(json.data.status || 'PROCESSING');
      }
    } catch (e) {
      console.warn('Failed to load order details from backend:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = () => {
    Alert.alert('Update Fulfillment Status', 'Select new order state:', [
      { text: 'Processing', onPress: () => updateStatusOnBackend('PROCESSING') },
      { text: 'Shipped', onPress: () => updateStatusOnBackend('SHIPPED') },
      { text: 'Delivered', onPress: () => updateStatusOnBackend('DELIVERED') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const updateStatusOnBackend = async (newStatus: string) => {
    setStatus(newStatus);
    if (!orderId) return;
    try {
      const token = useAdminAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token && token !== 'mock_admin_token') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers,
      });
      if (order) {
        setOrder({ ...order, status: newStatus });
      }
    } catch (e) {
      console.warn('Failed to update status on server:', e);
    }
  };

  // Safe parsed shipping address
  let addressObj: any = null;
  try {
    if (order?.shippingAddressJson) {
      addressObj = JSON.parse(order.shippingAddressJson);
    }
  } catch {
    addressObj = null;
  }

  const itemsList = (order?.items && order.items.length > 0)
    ? order.items.map((i) => ({
        name: i.productName,
        size: i.size || 'Standard',
        price: Number(i.unitPrice || 0),
        qty: Number(i.quantity || 1),
        imageUrl: i.imageUrl,
      }))
    : [
        { name: 'Pink Lehenga Set', size: '3-4Y', price: 2499, qty: 1, imageUrl: undefined },
        { name: 'Yellow Anarkali', size: '2-3Y', price: 1899, qty: 1, imageUrl: undefined },
        { name: "Boy's Kurta Set", size: '4-5Y', price: 1599, qty: 1, imageUrl: undefined },
      ];

  const subtotal = order?.subtotal != null ? Number(order.subtotal) : 5997;
  const discount = order?.discountAmount != null ? Number(order.discountAmount) : 300;
  const shipping = order?.shippingFee != null ? Number(order.shippingFee) : 0;
  const total = order?.totalAmount != null ? Number(order.totalAmount) : (subtotal - discount + shipping);
  const orderNumber = order?.orderNumber ? (order.orderNumber.startsWith('#') ? order.orderNumber : '#' + order.orderNumber) : '#SC123456';
  const orderDate = order?.createdAt || '12 May 2024, 10:00 AM';
  const customerName = order?.customerName || addressObj?.name || 'Priya Sharma';
  const customerEmail = order?.customerEmail || 'priya@gmail.com';
  const customerPhone = addressObj?.phone || '+91 9876543210';
  const street = addressObj?.street || '123, Green Park, Indiranagar';
  const cityState = addressObj?.cityStatePin || 'Bangalore, Karnataka - 560038';

  const handleGenerateInvoice = async () => {
    try {
      setGeneratingPdf(true);
      const invoiceNumber = 'INV-' + orderNumber.replace('#', '');

      const itemsHtml = itemsList.map((item, idx) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px; font-size: 13px; color: #1e293b;">${idx + 1}</td>
          <td style="padding: 12px 8px; font-size: 13px; font-weight: 600; color: #0f172a;">
            ${item.name}
            <div style="font-size: 11px; color: #64748b; font-weight: 400; margin-top: 2px;">Size: ${item.size}</div>
          </td>
          <td style="padding: 12px 8px; font-size: 13px; color: #334155; text-align: center;">${item.qty}</td>
          <td style="padding: 12px 8px; font-size: 13px; color: #334155; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
          <td style="padding: 12px 8px; font-size: 13px; font-weight: 600; color: #0f172a; text-align: right;">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Invoice ${invoiceNumber}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 24px;
              background-color: #ffffff;
            }
            .invoice-box {
              max-width: 800px;
              margin: auto;
              border: 1px solid #f1f5f9;
              border-radius: 12px;
              padding: 28px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            }
            .brand-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #ff4081;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .brand-title {
              font-size: 26px;
              font-weight: 800;
              color: #ff4081;
              letter-spacing: -0.5px;
            }
            .brand-subtitle {
              font-size: 11px;
              color: #64748b;
              margin-top: 4px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .invoice-meta {
              text-align: right;
            }
            .invoice-title {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
            }
            .meta-item {
              font-size: 12px;
              color: #64748b;
              margin-top: 3px;
            }
            .info-grid {
              display: flex;
              justify-content: space-between;
              margin-bottom: 28px;
            }
            .info-col {
              width: 48%;
            }
            .info-heading {
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              color: #94a3b8;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .info-content {
              font-size: 13px;
              line-height: 1.5;
              color: #334155;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            th {
              background-color: #f8fafc;
              padding: 10px 8px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #475569;
              letter-spacing: 0.5px;
              border-top: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
            }
            .summary-table {
              width: 280px;
              margin-left: auto;
              margin-bottom: 24px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 13px;
              color: #475569;
            }
            .summary-total {
              border-top: 2px solid #e2e8f0;
              margin-top: 8px;
              padding-top: 10px;
              font-size: 16px;
              font-weight: 800;
              color: #ff4081;
            }
            .footer {
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
            }
            .badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 9999px;
              background-color: #ecfdf5;
              color: #059669;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="brand-header">
              <div>
                <div class="brand-title">Southcolours</div>
                <div class="brand-subtitle">Kids & Women Ethnic Boutique</div>
              </div>
              <div class="invoice-meta">
                <div class="invoice-title">Tax Invoice</div>
                <div class="meta-item"><strong>Invoice #:</strong> ${invoiceNumber}</div>
                <div class="meta-item"><strong>Date:</strong> ${orderDate}</div>
                <div class="meta-item"><span class="badge">${status}</span></div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-col">
                <div class="info-heading">Billed & Shipped To:</div>
                <div class="info-content">
                  <strong>${customerName}</strong><br/>
                  ${street}<br/>
                  ${cityState}<br/>
                  Phone: ${customerPhone}<br/>
                  Email: ${customerEmail}
                </div>
              </div>
              <div class="info-col" style="text-align: right;">
                <div class="info-heading">Store Details:</div>
                <div class="info-content">
                  <strong>Southcolours App & Boutique</strong><br/>
                  Support: support@southcolours.in<br/>
                  Bangalore, Karnataka, India<br/>
                  GSTIN: 29AABCS1429B1Z8
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="text-align: left; width: 40px;">#</th>
                  <th style="text-align: left;">Item Description</th>
                  <th style="text-align: center; width: 60px;">Qty</th>
                  <th style="text-align: right; width: 90px;">Price</th>
                  <th style="text-align: right; width: 100px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="summary-table">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹${subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div class="summary-row" style="color: #059669;">
                <span>Discount:</span>
                <span>- ₹${discount.toLocaleString('en-IN')}</span>
              </div>
              <div class="summary-row">
                <span>Shipping Fee:</span>
                <span>${shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div class="summary-row summary-total">
                <span>Grand Total:</span>
                <span>₹${total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div class="footer">
              Thank you for shopping with Southcolours! For returns or support, contact help@southcolours.in<br/>
              This is a computer-generated invoice and does not require a physical signature.
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Download Invoice ${invoiceNumber}`,
        });
      } else {
        Alert.alert('Invoice Generated', `Invoice PDF saved at: ${uri}`);
      }
    } catch (err: any) {
      console.warn('Invoice generation error:', err);
      Alert.alert('Error', 'Failed to generate invoice PDF. ' + (err?.message || ''));
    } finally {
      setGeneratingPdf(false);
    }
  };

  const showAddressPopup = () => {
    Alert.alert(
      'Delivery Address',
      `${customerName}\n${street}\n${cityState}\nPhone: ${customerPhone}\nEmail: ${customerEmail}`,
      [{ text: 'Close' }]
    );
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.secondaryText }}>Loading order...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Header Card */}
        <View style={styles.topCard}>
          <View style={styles.orderTopRow}>
            <View>
              <Text style={styles.orderNumber}>Order {orderNumber}</Text>
              <Text style={styles.orderDate}>{orderDate}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Customer Details</Text>
          <View style={styles.customerRow}>
            <View style={styles.avatarCircle}>
              <Text style={{ color: colors.white, fontWeight: 'bold' }}>
                {customerName ? customerName.charAt(0).toUpperCase() : 'C'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerEmail}>{customerEmail}</Text>
              <Text style={styles.customerPhone}>{customerPhone}</Text>
            </View>
            <TouchableOpacity onPress={showAddressPopup}>
              <Text style={styles.viewAddressText}>View Address</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Items ({itemsList.length})</Text>
          {itemsList.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemThumb}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={{ width: 44, height: 44, borderRadius: 4 }} resizeMode="cover" />
                ) : (
                  <Text style={{ fontSize: 24 }}>👗</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSub}>Size: {item.size}</Text>
                <Text style={styles.itemSub}>₹ {item.price.toLocaleString('en-IN')} × {item.qty}</Text>
              </View>
              <Text style={styles.itemTotal}>₹ {(item.price * item.qty).toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>

        {/* Financial Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹ {subtotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.discountValue}>− ₹ {discount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.shippingValue}>
              {shipping === 0 ? 'FREE' : `₹ ${shipping.toLocaleString('en-IN')}`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹ {total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.updateStatusBtn} onPress={handleUpdateStatus}>
            <Text style={styles.updateStatusText}>Update Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.invoiceBtn, generatingPdf && { opacity: 0.6 }]}
            onPress={handleGenerateInvoice}
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.invoiceText}>Generate Invoice</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    paddingTop: statusBarHeight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  topCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  orderDate: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeading: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.md,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  customerEmail: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  customerPhone: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  viewAddressText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.semiBold,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  itemSub: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  itemTotal: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  summaryValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primaryText,
  },
  discountValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.success,
  },
  shippingValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  totalValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  updateStatusBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  updateStatusText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  invoiceBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  invoiceText: {
    color: colors.primaryText,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
  },
});
