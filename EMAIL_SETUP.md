# Email Notifications Setup Guide

## Overview
Email notifications are now integrated into your food vendor platform. Customers receive:
- **Order Confirmation** - When order is placed
- **Status Updates** - When order status changes (preparing, ready, picked up)
- **Cancellation Notice** - When order is cancelled

## Setup Instructions

### 1. Gmail Configuration (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification" on the left sidebar
3. Follow the setup process

#### Step 2: Create App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "App passwords" (appears after 2FA is enabled)
3. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your device type)
4. Click "Generate"  
5. Google will show a 16-character password
6. Copy this password (you'll use it in the next step)

#### Step 3: Add Credentials to .env
Add these lines to `server/.env`:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

Replace:
- `your-gmail@gmail.com` with your Gmail address
- `xxxx xxxx xxxx xxxx` with the 16-character App Password from Step 2

### 2. Alternative Email Services

#### Using SendGrid
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_USER=noreply@yourdomain.com
```

#### Using Mailgun
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.mailgun.org
EMAIL_USER=noreply@your-domain.mailgun.org
```

### 3. Optional: Custom Domain Email
Add to `.env` (for customization):
```env
CLIENT_URL=http://localhost:5173
```

This URL appears in emails for the "Track Your Order" button.

## Email Templates

### 1. Order Confirmation Email
Sent when customer places an order:
- Order number and timestamp
- Item list with quantities and prices
- Order total
- Pickup location and hours
- Link to track order

### 2. Status Update Emails
Sent when admin updates order status:
- **Pending**: Order received, queued for preparation
- **Preparing**: Order is being prepared
- **Ready**: Order is ready for pickup (call-to-action to pick up)
- **Picked Up**: Order completed, thank you message

### 3. Cancellation Email
Sent when order is cancelled:
- Reason for cancellation (if provided)
- Contact information for questions
- Apology message

## Testing Email Notifications

### 1. Test Order Confirmation
1. Start the servers: `npm start` (server) and `npm run dev` (client)
2. Go to http://localhost:5173
3. Add items to cart
4. Checkout and place an order
5. Check your email inbox for the confirmation email

### 2. Test Status Update
1. Go to admin panel: http://localhost:5173/admin
2. Find the test order in the orders list
3. Change the status (e.g., "Preparing" → "Ready")
4. Check your email for the status update notification

### 3. Test Cancellation
1. In admin panel, find an order
2. Click cancel order
3. Enter a cancellation reason
4. Check your email for the cancellation notice

## Troubleshooting

### Emails not being sent?

**Check 1: Gmail App Password**
- Make sure you created an App Password (not regular password)
- Gmail app passwords are 16 characters with spaces
- Verify the password is correctly pasted in `.env`

**Check 2: 2FA Enabled**
- App passwords only work if 2-Factor Authentication is enabled
- Enable it at [Google Account Security](https://myaccount.google.com/security)

**Check 3: Environment Variables**
- Restart the server after updating `.env`
- Verify variables are set: `echo $env:EMAIL_USER` (PowerShell)

**Check 4: Server Logs**
- Check server console for error messages like:
  ```
  [Email] Failed to send to user@example.com: Invalid login
  ```
- Common issues:
  - Wrong email/password
  - 2FA not enabled
  - Gmail security settings blocking less secure apps

**Check 5: Firewall/Network**
- Ensure port 587 (SMTP) is not blocked
- Check if your network blocks SMTP connections

### Using Gmail with 2FA
1. Regular Gmail passwords don't work with 2FA enabled
2. You MUST create an App Password
3. App passwords are 16 characters: `xxxx xxxx xxxx xxxx`

## Email Configuration for Production

When deploying to production:

1. **Use SendGrid or similar service** (recommended):
   - More reliable than Gmail
   - Better for high volume
   - Professional sender reputation

2. **Use a business email address**:
   - Not a personal Gmail account
   - E.g., `noreply@yourdomain.com`

3. **Add email templates database**:
   - Store templates in MongoDB
   - Allow admins to customize email content

4. **Set up bounce handling**:
   - Monitor failed email addresses
   - Remove invalid emails from list

## Customizing Email Templates

To customize email templates, edit `server/utils/emailService.js`:

```javascript
const emailTemplates = {
  orderConfirmation: (order, user) => ({
    subject: "Your custom subject here",
    html: `<!-- Your custom HTML here -->`
  }),
  // ... other templates
};
```

## Monitoring Email Delivery

Add this to your admin dashboard (future enhancement):
- View email logs
- Retry failed emails
- Update email addresses
- Customize templates per restaurant/vendor

## Support

If emails aren't working:
1. Check the console logs in the server terminal
2. Verify `.env` variables are correct
3. Test with `npm test` (if test suite is added)
4. Check Gmail security settings
5. Try a test email from Gmail directly to verify credentials

---

**Email notifications are now active!** 🎉
Customers will receive updates throughout their order journey.
