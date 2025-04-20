import express from 'express'
import {
  placeOrder,
  placeOrderRazorpay,
  
  updateStatus,
  allOrders,
  userOrders,
  cancelOrder,
        // 👈 added
  verifyRazorpayPayment     // 👈 added
} from '../controllers/orderController.js'

import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

// Payment features
orderRouter.post('/place', authUser, placeOrder)
//orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// New payment integrations
//orderRouter.post('/create-stripe-intent', authUser, createStripeIntent)       // 👈 for Stripe frontend intent
orderRouter.post('/verify-razorpay', authUser, verifyRazorpayPayment)         // 👈 for Razorpay signature verification

// User features
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/cancel', authUser, cancelOrder)

export default orderRouter;
