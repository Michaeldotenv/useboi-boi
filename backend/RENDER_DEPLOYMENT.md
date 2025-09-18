# Boiboi Backend - Render Deployment Guide

This guide will help you deploy your Go backend to Render.com with all necessary configurations.

## 🚀 **Quick Start**

### **Option 1: Using render.yaml (Recommended)**
1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically detect the `render.yaml` file
4. Set up environment variables
5. Deploy!

### **Option 2: Manual Setup**
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure build and start commands
4. Set environment variables
5. Deploy!

## 📋 **Prerequisites**

- GitHub repository with your backend code
- Render.com account
- MongoDB Atlas account (or use Render's MongoDB)
- Paystack account for payments
- Firebase project for notifications
- Email service credentials

## 🔧 **Environment Variables Setup**

### **Required Environment Variables:**

```bash
# Application Configuration
APP_ENV=production
PORT=8082
DB_NAME=boiboi-prod

# Database (Auto-configured if using Render MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Security
JWT_SIGNING_KEY=your-secure-jwt-signing-key-here-32-chars-minimum

# Payment Configuration (Paystack)
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key_here
PAYSTACK_PREFERRED_BANK=titan-paystack

# Email Configuration
BOIBOI_MAIL_PASSWORD=your_email_password_here

# Image Upload Service
IMGBB_API_KEY=your_imgbb_api_key_here

# Admin Configuration
ADMIN_KEY=your_secure_admin_key_here

# Server URLs
PING_URL=https://your-app-name.onrender.com/api/ping
SERVER_URL=https://your-app-name.onrender.com
```

## 🗄️ **Database Setup**

### **Option 1: Render MongoDB (Recommended)**
1. In your Render dashboard, create a new MongoDB database
2. Note the connection string
3. Add it to your environment variables as `MONGODB_URI`

### **Option 2: MongoDB Atlas**
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Add it to your environment variables as `MONGODB_URI`

## 🔥 **Firebase Setup**

1. Upload your Firebase service account JSON file to Render
2. The file path will be automatically handled by the application
3. Ensure your Firebase project has Cloud Messaging enabled

## 📧 **Email Service Setup**

The application uses SMTP for email services. Configure your email provider:
- **SMTP Host**: mail.privateemail.com
- **Port**: 465
- **Username**: hey@tackstry.com
- **Password**: Set in `BOIBOI_MAIL_PASSWORD`

## 💳 **Payment Integration (Paystack)**

1. Get your Paystack secret key from your dashboard
2. Set `PAYSTACK_SECRET_KEY` environment variable
3. Configure webhook URL: `https://your-app-name.onrender.com/webhook/payment/capture`

## 🖼️ **Image Upload (ImgBB)**

1. Get your ImgBB API key from https://api.imgbb.com/
2. Set `IMGBB_API_KEY` environment variable

## 🚀 **Deployment Steps**

### **Step 1: Prepare Your Repository**
```bash
# Ensure all files are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### **Step 2: Create Render Service**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your backend repository

### **Step 3: Configure Service**
- **Name**: `boiboi-backend` (or your preferred name)
- **Environment**: `Go`
- **Build Command**: `go build -o main cmd/app/main.go`
- **Start Command**: `./main`
- **Plan**: Choose based on your needs (Starter for development)

### **Step 4: Set Environment Variables**
Add all required environment variables from the list above.

### **Step 5: Deploy**
Click "Create Web Service" and wait for deployment to complete.

## 🔍 **Post-Deployment Verification**

### **Health Check**
```bash
curl https://your-app-name.onrender.com/api/ping
```

### **API Documentation**
Visit: `https://your-app-name.onrender.com/swagger/index.html`

### **Test Authentication**
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"1234567890","password":"password123","confirmPassword":"password123"}'
```

## 🐳 **Docker Deployment (Alternative)**

If you prefer Docker deployment:

```bash
# Build the Docker image
docker build -t boiboi-backend .

# Run locally for testing
docker run -p 8082:8082 --env-file skulpoint.env boiboi-backend
```

## 📊 **Monitoring & Logs**

### **Render Dashboard**
- View logs in real-time
- Monitor performance metrics
- Check deployment status

### **Application Logs**
The application uses structured logging with slog. Check Render logs for:
- Database connection status
- Payment processing logs
- Error messages
- Background worker status

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Build Failures**
   - Check Go version compatibility
   - Ensure all dependencies are in go.mod
   - Verify build command syntax

2. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check network access in MongoDB Atlas
   - Ensure database exists

3. **Environment Variable Issues**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure sensitive data is properly configured

4. **Firebase Issues**
   - Verify service account JSON file
   - Check Firebase project configuration
   - Ensure Cloud Messaging is enabled

### **Debug Commands:**
```bash
# Check if service is running
curl https://your-app-name.onrender.com/api/ping

# Test database connection
curl https://your-app-name.onrender.com/api/public/latestAppVersion

# Check logs in Render dashboard
```

## 🔄 **Continuous Deployment**

Render automatically deploys when you push to your main branch. To disable:
1. Go to your service settings
2. Disable "Auto-Deploy"

## 📈 **Scaling**

### **Upgrade Plan**
- Starter: $7/month (512MB RAM, 0.1 CPU)
- Standard: $25/month (2GB RAM, 1 CPU)
- Pro: $85/month (8GB RAM, 4 CPU)

### **Performance Optimization**
- Enable Redis for caching (add-on)
- Use CDN for static assets
- Optimize database queries
- Implement connection pooling

## 🔒 **Security Best Practices**

1. **Environment Variables**
   - Never commit sensitive data to git
   - Use Render's secure environment variable storage
   - Rotate keys regularly

2. **Database Security**
   - Use strong passwords
   - Enable IP whitelisting
   - Use SSL connections

3. **API Security**
   - Implement rate limiting
   - Use HTTPS only
   - Validate all inputs
   - Implement proper CORS

## 📞 **Support**

- **Render Documentation**: https://render.com/docs
- **Go Documentation**: https://golang.org/doc/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Paystack API**: https://paystack.com/docs/api/

## 🎯 **Next Steps**

After successful deployment:
1. Update your frontend API URLs
2. Configure webhooks for payments
3. Set up monitoring and alerts
4. Implement backup strategies
5. Plan for scaling

---

**Happy Deploying! 🚀**
