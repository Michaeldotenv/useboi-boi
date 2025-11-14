# Resend Domain Setup for useboiboi.com

## Current Status

✅ **Backend Configuration**: Complete
- Sender email updated to: `hello@useboiboi.com`
- RESEND_API_KEY is configured
- All email functions ready to use

⚠️ **Domain Verification**: Required for Production

---

## What You Need to Do

### Step 1: Access Resend Dashboard
1. Go to: https://resend.com/login
2. Log in with your Resend account
3. Navigate to: https://resend.com/domains

### Step 2: Add Your Domain
1. Click "Add Domain"
2. Enter: `useboiboi.com`
3. Click "Add"

### Step 3: Add DNS Records
Resend will provide you with DNS records to add. You'll need to add these to your domain registrar (where you bought useboiboi.com):

#### Required DNS Records:

**1. SPF Record (TXT)**
```
Type: TXT
Name: @ (or useboiboi.com)
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

**2. DKIM Record (TXT)**
```
Type: TXT
Name: resend._domainkey (Resend will provide the exact name)
Value: [Resend will provide this value]
TTL: 3600
```

**3. DMARC Record (TXT)** (Optional but recommended)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@useboiboi.com
TTL: 3600
```

### Step 4: Wait for Verification
- DNS propagation typically takes 5-30 minutes
- Can take up to 48 hours in rare cases
- Resend will automatically verify once DNS is updated
- You'll receive an email confirmation when verified

### Step 5: Test Email Sending
Once verified, test the email system:

```bash
# Test signup email (OTP)
curl -X POST https://skulpoint-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "your-email@example.com",
    "phone": "1234567890",
    "password": "Test123!",
    "confirmPassword": "Test123!"
  }'
```

---

## How to Add DNS Records

### If using Namecheap:
1. Log in to Namecheap
2. Go to Domain List
3. Click "Manage" next to useboiboi.com
4. Go to "Advanced DNS" tab
5. Click "Add New Record"
6. Add each DNS record from Step 3 above

### If using GoDaddy:
1. Log in to GoDaddy
2. Go to My Products
3. Click "DNS" next to useboiboi.com
4. Click "Add" under Records
5. Add each DNS record from Step 3 above

### If using Cloudflare:
1. Log in to Cloudflare
2. Select useboiboi.com domain
3. Go to DNS tab
4. Click "Add record"
5. Add each DNS record from Step 3 above

---

## Verification Checklist

Before going to production, verify:

- [ ] Domain added in Resend dashboard
- [ ] SPF record added to DNS
- [ ] DKIM record added to DNS
- [ ] DMARC record added to DNS (optional)
- [ ] DNS records verified (green checkmark in Resend)
- [ ] Test email sent successfully
- [ ] Test email received in inbox (not spam)

---

## Current Email Functions

All these functions are ready and will use `hello@useboiboi.com` as sender:

1. **SendOtpMail** - Account verification OTP
2. **SendWelcomeMail** - Customer welcome email
3. **SendMerchantWelcomeMail** - Merchant welcome email
4. **SendRiderWelcomeMail** - Rider welcome email
5. **SendWalletTopupMail** - Successful wallet funding notification
6. **SendFailedWalletTopupMail** - Failed wallet funding notification
7. **SendSuccessfulWithdrawalMail** - Successful withdrawal notification
8. **SendFailedWithdrawalMail** - Failed withdrawal notification
9. **SendForgotPasswordMail** - Password reset link

---

## Testing Without Domain Verification

If you want to test immediately without domain verification:

1. You can use the default Resend sandbox: `onboarding@resend.dev`
2. Emails will only be sent to verified email addresses in your Resend account
3. Not suitable for production

To revert temporarily:
```go
// In backend/utils/email.go, line 27
"from": "Boiboi Team <onboarding@resend.dev>",  // Sandbox mode
```

---

## Troubleshooting

### Issue: Domain not verifying
**Solution**: 
- Check DNS records are exactly as provided by Resend
- Wait longer (DNS can take up to 48 hours)
- Use DNS checker: https://dnschecker.org

### Issue: Emails going to spam
**Solution**:
- Ensure all DNS records (SPF, DKIM, DMARC) are added
- Domain must be fully verified
- Warm up your domain by sending gradually increasing volumes

### Issue: "Domain not verified" error
**Solution**:
- Complete domain verification in Resend dashboard first
- Check that DNS records are propagated
- Verify in Resend dashboard shows green checkmark

---

## Benefits After Domain Verification

✅ **Better Deliverability**: 95%+ inbox placement rate
✅ **Professional Sender**: Emails from @useboiboi.com
✅ **No Spam Flags**: Proper authentication reduces spam score
✅ **Brand Trust**: Recipients see your domain, not resend.dev
✅ **Higher Limits**: Increased sending limits
✅ **Analytics**: Track opens, clicks, bounces

---

## Support Resources

- **Resend Documentation**: https://resend.com/docs
- **Domain Verification Guide**: https://resend.com/docs/dashboard/domains/introduction
- **DNS Setup Help**: https://resend.com/docs/dashboard/domains/dns-records
- **Resend Status**: https://status.resend.com
- **Support Email**: support@resend.com

---

## Quick Commands

### Check DNS Records
```bash
# Check SPF record
nslookup -type=TXT useboiboi.com

# Check DKIM record
nslookup -type=TXT resend._domainkey.useboiboi.com

# Check DMARC record
nslookup -type=TXT _dmarc.useboiboi.com
```

### Test Backend Configuration
```bash
cd backend
go run test-email.go
```

---

## Next Steps

1. **Immediate**: Add domain and DNS records in Resend dashboard
2. **After Verification**: Test all email functions
3. **Monitor**: Check Resend dashboard for delivery metrics
4. **Optimize**: Review bounce rates and adjust as needed

---

## Summary

Your backend is fully configured and ready to send emails via Resend. The only remaining step is to verify your domain `useboiboi.com` in the Resend dashboard by adding the required DNS records. Once verified, all emails will be sent from `hello@useboiboi.com` with professional deliverability.

**Estimated Time**: 15-30 minutes (plus DNS propagation time)

🚀 Ready to go live once domain is verified!
