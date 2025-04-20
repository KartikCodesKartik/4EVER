import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
//import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

const createOrderInDB = async ({ userId, items, amount, address, paymentMethod, payment }) => {
    const orderData = {
        userId,
        items,
        amount,
        address,
        paymentMethod,
        payment,
        status: "Order Placed",
        isCancelled: false,
        date: Date.now()
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    return newOrder;
};

// COD
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        await createOrderInDB({ userId, items, amount, address, paymentMethod: "COD", payment: false });
        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Stripe
/*
const createStripeIntent = async (req, res) => {
    try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: "inr",
        });
        res.json({ success: true, clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        await createOrderInDB({ userId, items, amount, address, paymentMethod: "Stripe", payment: true });
        res.json({ success: true, message: "Stripe order placed successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};*/

// Razorpay
const placeOrderRazorpay = async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, items, amount, address } = req.body;

        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest("hex");

        if (generated_signature === razorpay_signature) {
            await createOrderInDB({ userId, items, amount, address, paymentMethod: "Razorpay", payment: true });
            res.json({ success: true, message: "Payment verified and order placed" });
        } else {
            res.json({ success: false, message: "Invalid Razorpay signature" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// All orders data for admin panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// User order data for frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update order status
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body
        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({ success: true, message: "Order Status Updated" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Cancel Order
const cancelOrder = async (req, res) => {
    try {
        const { orderId, userId } = req.body;

        // Find the order and ensure it belongs to the user
        const order = await orderModel.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found or unauthorized" });
        }

        // Optional: Prevent cancellation if order is already shipped or delivered
        if (order.status !== 'Order Placed') {
            return res.status(400).json({ success: false, message: "Order can't be cancelled after it's processed" });
        }

        // Cancel the order
        await orderModel.findByIdAndUpdate(orderId, { status: 'Cancelled', isCancelled: true });

        res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
        console.error("Cancel Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    placeOrder,
    placeOrderRazorpay,
   
    verifyRazorpayPayment,
    allOrders,
    updateStatus,
    userOrders,
    cancelOrder
};
