# E-commerce Application

A full-stack e-commerce application built with React, Node.js, and Razorpay integration. This application provides a seamless shopping experience with features like product management, cart functionality, coupon system, and secure payment processing.

## Features

- **User Authentication**: Secure login and registration system
- **Product Management**: Browse and search through product catalog
- **Shopping Cart**: Add/remove items, update quantities
- **Coupon System**: Apply discount coupons to orders
- **Payment Integration**: Secure checkout with Razorpay
- **Order Management**: Track order status and history
- **Responsive Design**: Mobile-friendly user interface
- **Gift Coupons**: Automatic coupon generation for orders above ₹3000

## Tech Stack

### Frontend
- React.js with Vite
- Framer Motion for animations
- TailwindCSS for styling
- Axios for API requests

### Backend
- Node.js
- Express.js
- MongoDB
- Redis for caching
- Razorpay payment gateway

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Redis
- Razorpay account

### Installation

1. Clone the repository
```bash
git clone https://github.com/KarunasriG/ecommerce.git
cd ecommerce
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables

Create `.env` file in the backend directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
RAZORPAY_API_KEY=your_razorpay_key
RAZORPAY_API_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the development servers

```bash
# Start backend server
cd backend
npm start

# Start frontend development server
cd ../frontend
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.