const nodemailer = require("nodemailer");

// Configure your email service (Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
    service: "gmail", // or your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Status-specific messages
const STATUS_MESSAGES = {
    Pending: "Your order has been placed and is pending confirmation.",
    Confirmed: "Your order has been confirmed! We're preparing it for shipment.",
    Packed: "Your order is packed and ready to ship.",
    Shipped: "Your order is on its way! Track your package with the details below.",
    Delivered: "Your order has been delivered. Thank you for your purchase!",
    Cancelled: "Your order has been cancelled. Please contact support for details.",
};

async function sendOrderStatusEmail(order, userEmail, userName) {
    try {
        // ✅ Convert values to numbers
        const subtotal = Number(order.subtotal) || 0;
        const discount = Number(order.discount) || 0;
        const shippingCharge = Number(order.shippingCharge) || 0;
        const grandTotal = Number(order.grandTotal) || 0;

        // Build product rows with images
        const productRows = order.items
            .map(
                (item) => `
      <tr style="border-bottom: 1px solid #eee; padding: 10px 0;">
        <td style="padding: 10px;">
          ${item.image_url
                        ? `<img src="${item.image_url}" alt="${item.productName}" 
                   style="max-width: 80px; max-height: 80px; border-radius: 4px;" />`
                        : `<div style="width: 80px; height: 80px; background: #f0f0f0; 
                   border-radius: 4px; display: flex; align-items: center; 
                   justify-content: center;">No Image</div>`
                    }
        </td>
        <td style="padding: 10px;">
          <p style="margin: 0; font-weight: bold;">${item.productName}</p>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">
            ${item.color ? `Color: ${item.color}` : ""} 
            ${item.size ? `| Size: ${item.size}` : ""}
          </p>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">SKU: ${item.sku || "N/A"}</p>
        </td>
        <td style="padding: 10px; text-align: center;">
          <p style="margin: 0;">${item.quantity}</p>
        </td>
        <td style="padding: 10px; text-align: right;">
          <p style="margin: 0;">₹${Number(item.price).toFixed(2)}</p>
        </td>
        <td style="padding: 10px; text-align: right;">
          <p style="margin: 0; font-weight: bold;">₹${Number(item.subtotal).toFixed(2)}</p>
        </td>
      </tr>
    `
            )
            .join("");

        const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; }
            .status-badge { 
              display: inline-block; 
              background: #4CAF50; 
              color: white; 
              padding: 8px 16px; 
              border-radius: 20px; 
              font-weight: bold;
              margin: 10px 0;
            }
            .status-badge.pending { background: #FFC107; }
            .status-badge.confirmed { background: #2196F3; }
            .status-badge.packed { background: #FF9800; }
            .status-badge.shipped { background: #9C27B0; }
            .status-badge.delivered { background: #4CAF50; }
            .status-badge.cancelled { background: #f44336; }
            table { width: 100%; border-collapse: collapse; }
            .order-summary { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .summary-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .summary-row.total { font-weight: bold; font-size: 18px; border-top: 2px solid #eee; padding-top: 10px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            .button { 
              display: inline-block; 
              background: #667eea; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 4px; 
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Status Update</h1>
              <p>Hi ${userName},</p>
            </div>

            <div class="content">
              <div class="status-badge ${order.status.toLowerCase()}">
                ${order.status.toUpperCase()}
              </div>

              <p>${STATUS_MESSAGES[order.status] || "Your order status has been updated."}</p>

              <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h3 style="margin-top: 0;">Order Details</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                <p><strong>Shipping Address:</strong></p>
                <p style="margin-left: 10px; color: #666;">
                  ${order.shippingName}<br>
                  ${order.shippingAddress}<br>
                  ${order.shippingCity}, ${order.shippingState} ${order.shippingPincode}<br>
                  ${order.shippingPhone}
                </p>
              </div>

              <h3>Order Items</h3>
              <table>
                <thead style="background: #f5f5f5;">
                  <tr>
                    <th style="padding: 10px; text-align: left;">Image</th>
                    <th style="padding: 10px; text-align: left;">Product</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${productRows}
                </tbody>
              </table>

              <div class="order-summary">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>₹${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Discount:</span>
                  <span>-₹${discount.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping:</span>
                  <span>₹${shippingCharge.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                  <span>Grand Total:</span>
                  <span>₹${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/orders/${order.id}" class="button">
                  View Order Details
                </a>
              </p>

              <p style="color: #666; font-size: 14px;">
                If you have any questions, please contact our support team at 
                <strong>${process.env.SUPPORT_EMAIL}</strong>
              </p>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Order ${order.orderNumber} - Status: ${order.status}`,
            html: htmlTemplate,
        });

        console.log(`✅ Email sent to ${userEmail} for order ${order.orderNumber}`);
        return true;
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        return false;
    }
}

module.exports = { sendOrderStatusEmail };