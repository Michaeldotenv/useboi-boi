# Boiboi - E-commerce & Delivery Platform

A comprehensive e-commerce and delivery platform built with Go backend and Next.js frontend, featuring food delivery, errands, and logistics services for campus communities.

## 🚀 Live Demo

- **Frontend**: [https://useboiboi.vercel.app](https://useboiboi.vercel.app)
- **Backend API**: [https://skulpoint-backend.onrender.com](https://skulpoint-backend.onrender.com)

## 📱 Features

### Core Services
- **Food Delivery**: Restaurant discovery, ordering, and real-time tracking
- **Errands Service**: Grocery delivery and task completion
- **Business Solutions**: Logistics services for businesses
- **Scheduled Delivery**: Time-based delivery slots (10am, 12pm, 3pm, 6pm, 8pm)

### User Management
- **Multi-role System**: Customers, Merchants, Riders, Admins
- **Authentication**: JWT-based with OTP verification
- **Virtual Wallets**: Built-in payment system with Paystack integration
- **Real-time Notifications**: Firebase Cloud Messaging

### Business Features
- **Store Management**: Merchant dashboard for inventory and orders
- **Rider Assignment**: Automated delivery partner allocation
- **Rating System**: Customer feedback for quality assurance
- **Commission Management**: Automated revenue sharing

## 🏗️ Architecture

### Backend (Go)
- **Framework**: Gin HTTP framework
- **Database**: MongoDB with official driver
- **Authentication**: JWT tokens with bcrypt hashing
- **Payments**: Paystack integration
- **Notifications**: Firebase Cloud Messaging
- **Email**: SMTP with HTML templates

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Custom component library
- **Deployment**: Vercel

## 🛠️ Tech Stack

### Backend
- Go 1.22.0
- Gin Web Framework
- MongoDB
- Firebase Admin SDK
- Paystack API
- JWT Authentication
- SMTP Email Service

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand
- React Hook Form
- Axios

### Infrastructure
- **Backend Hosting**: Render.com
- **Frontend Hosting**: Vercel
- **Database**: MongoDB Atlas
- **CDN**: Vercel Edge Network

## 📦 Installation

### Prerequisites
- Go 1.22.0+
- Node.js 18+
- MongoDB Atlas account
- Paystack account
- Firebase project

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/boiboi.git
cd boiboi/backend
```

2. **Install dependencies**
```bash
go mod download
```

3. **Environment Configuration**
```bash
cp skulpoint.env.example skulpoint.env
# Edit skulpoint.env with your configuration
```

4. **Run the application**
```bash
go run cmd/app/main.go
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp env.template .env.local
# Edit .env.local with your configuration
```

4. **Run the development server**
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

#### Backend (`skulpoint.env`)
```env
MONGODB_URI=mongodb+srv://...
JWT_SIGNING_KEY=your-jwt-secret
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PREFERRED_BANK=titan-paystack
BOIBOI_MAIL_PASSWORD=your-email-password
ADMIN_KEY=your-admin-key
```

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_APP_NAME=Boiboi
```

## 📚 API Documentation

The backend includes comprehensive Swagger documentation available at:
- **Development**: `http://localhost:8082/swagger/index.html`
- **Production**: `https://skulpoint-backend.onrender.com/swagger/index.html`

### Key Endpoints

#### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verifySignup` - OTP verification

#### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders/checkout` - Create new order
- `PATCH /api/orders/:id/orderProgress` - Update order status

#### Payments
- `POST /api/wallet/initializeTransaction` - Initialize payment
- `POST /api/createBankAccount` - Create virtual account

## 🚀 Deployment

### Backend (Render.com)
1. Connect your GitHub repository
2. Set build command: `cd backend && go build -o main cmd/app/main.go`
3. Set start command: `cd backend && ./main`
4. Configure environment variables

### Frontend (Vercel)
1. Connect your GitHub repository
2. Set root directory to `frontend`
3. Configure environment variables
4. Deploy automatically on push

## 📱 Mobile App

The platform also includes mobile applications:
- **Android**: Available on Google Play Store
- **iOS**: Available on Apple App Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: boiboi.nigeria@gmail.com
- **Support**: Available 24/7
- **Documentation**: [API Docs](https://skulpoint-backend.onrender.com/swagger/index.html)

## 🙏 Acknowledgments

- Built with ❤️ for campus communities
- Powered by modern web technologies
- Designed for scalability and reliability

---

© Boi Technologies 2025. All rights reserved.
