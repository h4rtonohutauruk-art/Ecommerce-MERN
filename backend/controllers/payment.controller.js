import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import dotenv from "dotenv";
import Order from "../models/orders.model.js";
import User from "../models/user.model.js";

dotenv.config();

export const createCheckoutSession = async (req, res) => {
  try {
    console.log("calling create checkout session");
    const { products, couponCode } = req.body;
    const user = req.user;

    // console.log("this is couponCode from request:", couponCode);
    // console.log("this is product from request:", products);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: "Invalid or empty products array",
      });
    }

    let totalAmount = 0;

    // console.log("this is product:", products);
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); //stripe wants u to send in the format of cents $10 * 10
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: product.image ? [product.image] : [],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    // console.log("this is lineItems : ", lineItems);

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100,
        );
      }
    }
    // console.log("this is coupon code : ", couponCode);
    // console.log("this is coupon  : ", coupon);
    // console.log("this is totalAmount  : ", totalAmount);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,

      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          })),
        ),
      },
    });

    // console.log("check session checkout:", session);

    // if user buy > 20000 = 200 * 100
    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    // return url
    res.status(200).json({
      url: session.url,
      id: session.id,
      totalAmount: totalAmount / 100,
    });
  } catch (error) {
    console.log("Error in createCheckoutSession: ", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: userId,
  });
  await newCoupon.save();
  return newCoupon;
}

export const createCheckoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    console.log("ini dari checkout-success controller:", req.body);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const existingOrder = await Order.findOne({
      stripeSessionId: sessionId,
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        messsage: "Order already processed",
        orderId: existingOrder._id,
      });
    }

    console.log("SESSION METADATA :", session.metadata);
    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          {
            isActive: false,
          },
        );
      }
      //   create a new order
      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100, //comvert from cents to dollars
        stripeSessionId: session.id,
      });
      await newOrder.save();

      // clear cart
      await User.findByIdAndUpdate(session.metadata.userId, {
        cartItems: [],
      });
      res.status(200).json({
        success: true,
        message:
          "Payment successful, order created, and coupon deactivated if used",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.log("Error processing successful checout:", error.message);
    res.status(500).json({
      message: "Error processing successful checout",
      error: error.message,
    });
  }
};
