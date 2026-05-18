const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email templates
const emailTemplates = {
  orderConfirmation: (order, user) => {
    const clientUrl = getClientUrl();
    return {
      subject: `Order Confirmed! #${String(order._id).slice(-8).toUpperCase()}`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e85d04 0%, #d54315 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .order-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #e85d04; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .item:last-child { border-bottom: none; }
            .total { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #e85d04; margin-top: 15px; }
            .pickup-info { background: #dcfce7; padding: 15px; border-radius: 6px; margin: 15px 0; color: #166534; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
            .button { display: inline-block; padding: 12px 30px; background: #e85d04; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Order Confirmed!</h1>
              <p>Thank you for your order</p>
            </div>

            <div class="content">
              <p>Hi ${user.name || user.email},</p>
              <p>Your order has been received and is being prepared. Here's a summary:</p>

              <div class="order-details">
                <h3 style="margin-top: 0; color: #e85d04;">Order #${String(order._id).slice(-8).toUpperCase()}</h3>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>

                <h4>Items Ordered:</h4>
                ${order.items
                  .map(
                    (item) =>
                      `<div class="item">
                  <span>${item.name} (x${item.qty})</span>
                  <span>$${(item.price * item.qty).toFixed(2)}</span>
                </div>`
                  )
                  .join("")}

                <div class="total">
                  <span>Total:</span>
                  <span>$${order.subtotal.toFixed(2)}</span>
                </div>
              </div>

              ${
                order.note
                  ? `<div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; color: #92400e;">
                <strong>Special Instructions:</strong> ${order.note}
              </div>`
                  : ""
              }

              <div class="pickup-info">
                <h4 style="margin-top: 0;">📍 Pickup Location</h4>
                <p><strong>Address:</strong> 42W 46th Street, NY 10036</p>
                <p><strong>Phone:</strong> (212) 555-0123</p>
                <p><strong>Hours:</strong> 11:00 AM - 11:00 PM Daily</p>
                <p style="margin: 15px 0 0 0; font-size: 14px;">We'll notify you when your order is ready for pickup!</p>
              </div>

              <p style="text-align: center;">
                <a href="${clientUrl}/orders/${String(order._id)}" class="button">Track Your Order</a>
              </p>

              <p>If you have any questions, please don't hesitate to reach out to us.</p>
              <p>Thank you for choosing MANU Food Vendor!</p>
            </div>

            <div class="footer">
              <p>&copy; 2026 MANU Food Vendor. All rights reserved.</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    };
  },

  orderStatusUpdate: (order, user, statusInfo) => {
    const clientUrl = getClientUrl();
    return {
      subject: `Order Update: ${statusInfo.label} - #${String(order._id).slice(-8).toUpperCase()}`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.darkColor} 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .status-box { background: ${statusInfo.bgColor}; padding: 15px; border-radius: 6px; margin: 15px 0; color: ${statusInfo.color}; text-align: center; }
            .status-box h2 { margin: 0; font-size: 24px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
            .button { display: inline-block; padding: 12px 30px; background: ${statusInfo.color}; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusInfo.icon} ${statusInfo.label}</h1>
              <p>Order #${String(order._id).slice(-8).toUpperCase()}</p>
            </div>

            <div class="content">
              <p>Hi ${user.name || user.email},</p>
              <p>${statusInfo.message}</p>

              <div class="status-box">
                <h2>${statusInfo.icon} ${statusInfo.label}</h2>
              </div>

              ${
                statusInfo.key === "ready"
                  ? `<div style="background: #dcfce7; padding: 15px; border-radius: 6px; margin: 15px 0; color: #166534;">
                <h3 style="margin-top: 0;">🎉 Your order is ready!</h3>
                <p>Please come pick it up at:</p>
                <p><strong>42W 46th Street, NY 10036</strong></p>
              </div>`
                  : ""
              }

              ${
                statusInfo.key === "picked_up"
                  ? `<div style="background: #dcfce7; padding: 15px; border-radius: 6px; margin: 15px 0; color: #166534;">
                <h3 style="margin-top: 0;">✓ Thank you!</h3>
                <p>We hope you enjoyed your food! Come back soon.</p>
              </div>`
                  : ""
              }

              <p style="text-align: center;">
                <a href="${clientUrl}/orders/${String(order._id)}" class="button">View Order Details</a>
              </p>
            </div>

            <div class="footer">
              <p>&copy; 2026 MANU Food Vendor. All rights reserved.</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    };
  },

  orderCancelled: (order, user, adminNote) => {
    const clientUrl = getClientUrl();
    return {
      subject: `Order Cancelled - #${String(order._id).slice(-8).toUpperCase()}`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .note { background: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; color: #991b1b; border-left: 4px solid #ef4444; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✗ Order Cancelled</h1>
              <p>Order #${String(order._id).slice(-8).toUpperCase()}</p>
            </div>

            <div class="content">
              <p>Hi ${user.name || user.email},</p>
              <p>Unfortunately, your order has been cancelled.</p>

              ${
                adminNote
                  ? `<div class="note">
                <strong>Reason:</strong> ${adminNote}
              </div>`
                  : "<p>For more information, please contact us.</p>"
              }

              <p>If you have any questions or concerns, please reach out to us at (212) 555-0123.</p>
            </div>

            <div class="footer">
              <p>&copy; 2026 MANU Food Vendor. All rights reserved.</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    };
  },
};

// Status information for emails
const statusInfo = {
  pending: {
    key: "pending",
    label: "Order Received",
    icon: "⏳",
    color: "#3b82f6",
    darkColor: "#1e40af",
    bgColor: "#dbeafe",
    message: "Your order has been received and queued for preparation.",
  },
  preparing: {
    key: "preparing",
    label: "Preparing Your Order",
    icon: "👨‍🍳",
    color: "#f59e0b",
    darkColor: "#b45309",
    bgColor: "#fef3c7",
    message: "Our team is now preparing your delicious order!",
  },
  ready: {
    key: "ready",
    label: "Ready for Pickup",
    icon: "✓",
    color: "#22c55e",
    darkColor: "#15803d",
    bgColor: "#dcfce7",
    message: "Your order is ready! Please come pick it up at your earliest convenience.",
  },
  picked_up: {
    key: "picked_up",
    label: "Order Completed",
    icon: "✓",
    color: "#6b7280",
    darkColor: "#374151",
    bgColor: "#f3f4f6",
    message: "Your order has been picked up. Thank you for your order!",
  },
};

// Helper to get client URL without trailing slash
const getClientUrl = () => {
  const url = process.env.CLIENT_URL || "http://localhost:5173";
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates,
  statusInfo,
};
