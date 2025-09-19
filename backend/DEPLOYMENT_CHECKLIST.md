# 🚀 Boiboi Backend - Render Deployment Checklist

## ✅ **Pre-Deployment Checklist**

### **1. Code Preparation**
- [x] All files committed to Git
- [x] `render.yaml` configuration created
- [x] `Dockerfile` created for containerized deployment
- [x] `.dockerignore` file created
- [x] `Makefile` updated with production commands
- [x] Health check endpoint added (`/api/ping`)
- [x] Build tested successfully

### **2. Environment Variables Setup**
- [ ] `APP_ENV=production`
- [ ] `PORT=8082`
- [ ] `DB_NAME=boiboi-prod`
- [ ] `MONGODB_URI` (from Render MongoDB or Atlas)
- [ ] `JWT_SIGNING_KEY` (secure 32+ character key)
- [ ] `PAYSTACK_SECRET_KEY` (your Paystack secret key)
- [ ] `PAYSTACK_PREFERRED_BANK=titan-paystack`
- [ ] `BOIBOI_MAIL_PASSWORD` (email service password)
- [ ] `IMGBB_API_KEY` (image upload service key)
- [ ] `ADMIN_KEY` (secure admin access key)
- [ ] `PING_URL=https://your-app-name.onrender.com/api/ping`
- [ ] `SERVER_URL=https://your-app-name.onrender.com`
 - [ ] `FIREBASE_PROJECT_ID` (your Firebase project ID)
 - [ ] `GOOGLE_APPLICATION_CREDENTIALS` (optional: path to service account JSON)

### **3. External Services Setup**
- [ ] **MongoDB**: Atlas cluster created or Render MongoDB configured
- [ ] **Paystack**: Account configured with webhook URL
- [ ] **Firebase**: Project setup with Cloud Messaging enabled
- [ ] **Email Service**: SMTP credentials configured
- [ ] **ImgBB**: API key obtained for image uploads

### **4. Render Configuration**
- [ ] GitHub repository connected
- [ ] Web service created
- [ ] Build command: `go build -o main cmd/app/main.go`
- [ ] Start command: `./main`
- [ ] Environment variables configured
- [ ] Firebase service account JSON uploaded

## 🎯 **Deployment Steps**

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### **Step 2: Create Render Service**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your backend repository

### **Step 3: Configure Service**
- **Name**: `boiboi-backend`
- **Environment**: `Go`
- **Build Command**: `go build -o main cmd/app/main.go`
- **Start Command**: `./main`
- **Plan**: Starter ($7/month) or Standard ($25/month)

### **Step 4: Set Environment Variables**
Copy all variables from `env.production.template` and set them in Render dashboard.

### **Step 5: Deploy**
Click "Create Web Service" and monitor the deployment logs.

## 🔍 **Post-Deployment Verification**

### **Health Check**
```bash
curl https://your-app-name.onrender.com/api/ping
```
Expected response:
```json
{
  "status": "ok",
  "message": "Boiboi Backend is running",
  "timestamp": 1695123456
}
```

### **API Documentation**
Visit: `https://your-app-name.onrender.com/swagger/index.html`

### **Test Authentication**
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

1. **Build Failures**
   - Check Go version compatibility
   - Verify all dependencies in go.mod
   - Check build logs in Render dashboard

2. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check network access in MongoDB Atlas
   - Ensure database exists and is accessible

3. **Environment Variable Issues**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure sensitive data is properly configured

4. **Firebase Issues**
   - Verify service account JSON file is uploaded
   - Ensure `FIREBASE_PROJECT_ID` is set and matches the project
   - Ensure Cloud Messaging is enabled

## 📊 **Monitoring**

### **Render Dashboard**
- Real-time logs
- Performance metrics
- Deployment status
- Resource usage

### **Application Health**
- Database connection status
- Payment processing logs
- Background worker status
- Error tracking

## 🔄 **Continuous Deployment**

Render automatically deploys when you push to main branch. To manage:
- **Auto-deploy**: Enabled by default
- **Manual deploy**: Available in dashboard
- **Rollback**: Previous deployments available

## 📈 **Scaling Options**

### **Render Plans**
- **Starter**: $7/month (512MB RAM, 0.1 CPU)
- **Standard**: $25/month (2GB RAM, 1 CPU) 
- **Pro**: $85/month (8GB RAM, 4 CPU)

### **Performance Optimization**
- Enable Redis for caching
- Use CDN for static assets
- Optimize database queries
- Implement connection pooling

## 🔒 **Security Checklist**

- [ ] All environment variables are secure
- [ ] JWT signing key is strong and unique
- [ ] Database access is restricted
- [ ] CORS is properly configured
- [ ] HTTPS is enforced
- [ ] Admin access is protected
- [ ] Payment webhooks are secured

## 📞 **Support Resources**

- **Render Documentation**: https://render.com/docs
- **Go Documentation**: https://golang.org/doc/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Paystack API**: https://paystack.com/docs/api/
- **Firebase Docs**: https://firebase.google.com/docs

## 🎉 **Success Criteria**

Your deployment is successful when:
- [ ] Health check endpoint responds
- [ ] API documentation is accessible
- [ ] Authentication endpoints work
- [ ] Database connection is established
- [ ] Payment integration is functional
- [ ] Email notifications are working
- [ ] Push notifications are operational

---

**Ready to deploy! 🚀**

Once all items are checked, your Boiboi backend will be ready for production use on Render.
