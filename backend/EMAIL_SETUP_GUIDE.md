# 📧 Email Verification Setup Guide

This guide will help you configure email sending for user verification.

## 🎯 What This Does

When users sign up, they receive an email with a verification link:
```
Subject: Verify Your Email Address
Body: Click this link to verify: http://localhost:5173/verify-email?token=abc123...
```

---

## 🚀 Quick Setup (Choose One Option)

### Option 1: Test Setup (Ethereal Email) - FREE & INSTANT ⚡

**Best for:** Development, testing, demo
**Pros:** Instant setup, no real emails sent, preview links
**Cons:** Emails don't actually arrive in real inbox

#### Steps:

1. **Open Terminal** and run:
   ```bash
   node backend/setup-email.js
   ```

2. **Or manually** visit https://ethereal.email/ and click "Create Ethereal Account"

3. **Copy credentials** to your `.env` file:
   ```env
   EMAIL_HOST="smtp.ethereal.email"
   EMAIL_USER="your.generated@ethereal.email"
   EMAIL_PASSWORD="your-generated-password"
   EMAIL_FROM="Streamify <noreply@streamify.com>"
   FRONTEND_URL="http://localhost:5173"
   NODE_ENV="development"
   ```

4. **Restart server**

5. **Test signup** - Check console for preview URL like:
   ```
   📮 Preview URL: https://ethereal.email/message/XXX
   ```

---

### Option 2: Gmail Setup - REAL EMAILS 📮

**Best for:** Production, real user testing
**Pros:** Real emails delivered to real inboxes
**Cons:** Requires Google account, app password setup

#### Steps:

**1. Enable 2-Factor Authentication (if not already enabled):**
   - Go to: https://myaccount.google.com/security
   - Scroll to "2-Step Verification"
   - Click "Get started" and follow steps

**2. Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter: "Streamify App"
   - Click "Generate"
   - **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

**3. Update `.env` file:**
   ```env
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-16-char-app-password"
   EMAIL_FROM="Streamify <your-email@gmail.com>"
   FRONTEND_URL="http://localhost:5173"
   NODE_ENV="production"
   ```

**4. Restart server:**
   ```bash
   npm start
   ```

---

### Option 3: Other Email Services

#### **SendGrid** (Recommended for Production)
```env
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_USER="apikey"
EMAIL_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"
NODE_ENV="production"
```

#### **AWS SES**
```env
EMAIL_HOST="email-smtp.us-east-1.amazonaws.com"
EMAIL_USER="your-aws-access-key"
EMAIL_PASSWORD="your-aws-secret-key"
EMAIL_FROM="noreply@yourdomain.com"
NODE_ENV="production"
```

#### **Outlook/Hotmail**
```env
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_USER="your-email@outlook.com"
EMAIL_PASSWORD="your-password"
EMAIL_FROM="Streamify <your-email@outlook.com>"
NODE_ENV="production"
```

---

## 🧪 Testing Your Email Setup

### 1. Test Email Configuration

Run this test script:
```bash
node backend/test-email.js
```

This will:
- Check if email credentials are configured
- Send a test email
- Display any errors

### 2. Test User Signup

**Via Frontend:**
1. Start frontend: `npm run dev` (in frontend folder)
2. Go to signup page
3. Enter your real email
4. Check your inbox (or Ethereal preview URL in console)

**Via API:**
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### 3. Check Console Logs

You should see:
```
🔍 Validating email: your-email@gmail.com
✅ Email validation passed
⏳ User created. Waiting for email verification...
✅ Verification email sent to your-email@gmail.com
📧 Message ID: <some-id>
📮 Preview URL: https://ethereal.email/message/XXX (if using Ethereal)
```

---

## 🔧 Troubleshooting

### Issue 1: "Error sending verification email"

**Check:**
- Are `EMAIL_USER` and `EMAIL_PASSWORD` set in `.env`?
- Did you restart the server after updating `.env`?
- Is the password correct? (For Gmail, use app password, not regular password)

**Test:**
```bash
node -e "console.log(process.env.EMAIL_USER)"
```

---

### Issue 2: Gmail "Less secure app" error

**Solution:**
- You MUST use an App Password (not your regular password)
- Enable 2FA first, then create app password
- Link: https://myaccount.google.com/apppasswords

---

### Issue 3: Emails not arriving (Gmail)

**Possible causes:**
1. **Spam folder** - Check spam/junk
2. **Gmail blocks** - Gmail may block first few emails
3. **Wrong credentials** - Double-check email and password

**Fix:**
1. Add your email to "safe senders"
2. Try sending to a different email
3. Use Ethereal for testing first

---

### Issue 4: "ECONNREFUSED" or "ETIMEDOUT"

**Cause:** Can't connect to SMTP server

**Solutions:**
- Check internet connection
- Verify `EMAIL_HOST` is correct
- Some networks block port 587/465
- Try different network (mobile hotspot)

---

## 📝 Current Configuration Status

Run this to check your current setup:
```bash
node -e "require('dotenv').config(); console.log('Email Host:', process.env.EMAIL_HOST); console.log('Email User:', process.env.EMAIL_USER); console.log('Email Configured:', !!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD);"
```

---

## 🎨 Customizing Email Templates

The email templates are in `backend/src/lib/email.js`

### Current Template:
- **Subject:** "Verify Your Email Address"
- **Content:** Welcome message with verification button
- **Style:** Clean HTML with inline CSS

### To Customize:

Edit the `mailOptions.html` in `sendVerificationEmail()`:

```javascript
html: `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      /* Add your custom styles here */
    </style>
  </head>
  <body>
    <!-- Your custom HTML here -->
  </body>
  </html>
`
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Use `.env.example` for documentation

2. **Use App Passwords for Gmail**
   - Don't use your main password
   - Can be revoked if compromised

3. **Use environment variables in production**
   - Vercel, Heroku, etc. have environment variable settings
   - Never hardcode credentials

4. **Rotate credentials regularly**
   - Especially if exposed

---

## 📊 Email Flow Diagram

```
User Signs Up
     ↓
Email Validation (DNS + SMTP)
     ↓
User Created in DB (isEmailVerified: false)
     ↓
Generate Verification Token
     ↓
📧 Send Email with Link
     ↓
User Checks Inbox
     ↓
Click Verification Link
     ↓
Backend Verifies Token
     ↓
User.isEmailVerified = true
     ↓
✅ Stream User Created
     ↓
Full Access Granted
```

---

## ✅ Quick Checklist

- [ ] Choose email service (Ethereal/Gmail/Other)
- [ ] Update `.env` with credentials
- [ ] Restart backend server
- [ ] Test signup with real email
- [ ] Check inbox/console for email
- [ ] Click verification link
- [ ] Verify Stream user created

---

## 🆘 Need Help?

If you're still having issues:

1. Check console logs for detailed error messages
2. Verify all environment variables are set
3. Test with Ethereal first (easier to debug)
4. Make sure frontend URL is correct in `.env`

---

## 🎉 Success Indicators

You know it's working when:
- ✅ Console shows: "Verification email sent"
- ✅ You receive email in inbox (or see Ethereal preview)
- ✅ Clicking link verifies your account
- ✅ Console shows: "Stream user created for verified user"
