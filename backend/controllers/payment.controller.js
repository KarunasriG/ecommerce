import { razorpayInstance } from "../lib/payment.js";
import crypto from "crypto";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    console.log("✅ create-checkout-session route hit");

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "Invalid or empty products array",
      });
    }

    let totalAmount = 0;
    products.forEach((product) => {
      totalAmount += product.price * product.quantity;
    });

    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          totalAmount * (coupon.discountPercentage / 100)
        );
      }
    }

    const options = {
      amount: totalAmount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(products),
      },
    };

    const order = await razorpayInstance.orders.create(options);

    if (totalAmount >= 3000) {
      await createNewCoupon(req.user._id, 10);
    }

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_API_KEY,
    });
  } catch (error) {
    console.log("Error in createCheckoutSession controller", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createNewCoupon = async (userId, discountPercentage) => {
  const existingCoupon = await Coupon.findOne({ userId });

  if (!existingCoupon) {
    const newCoupon = new Coupon({
      code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      discountPercentage: 10,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userId: userId,
    });

    await newCoupon.save();
    return newCoupon;
  } else {
    console.log("Coupon already exists for this user.");
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await razorpayInstance.orders.fetch(razorpay_order_id);
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

    if (payment.status === "captured") {
      const { userId, couponCode, products } = order.notes;

      if (couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: couponCode,
            userId: userId,
          },
          { isActive: false }
        );
      }

      const parsedProducts = JSON.parse(products);
      const newOrder = new Order({
        user: userId,
        products: parsedProducts.map((product) => ({
          product: product._id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: order.amount / 100, // Convert from paise to rupees
        razorpay_order_id: order.id,
        razorpay_payment_id: payment.id,
      });

      await newOrder.save();

      res.status(200).json({
        success: true,
        message:
          "Payment successful, order created, and coupon deactivated if used.",
        orderId: newOrder._id,
      });
    } else {
      res.status(400).json({
        message: "Payment failed or pending",
        status: payment.status,
      });
    }
  } catch (error) {
    console.error("Error in checkoutSuccess controller:", {
      message: error.message,
      stack: error.stack,
      details: error,
    });
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
