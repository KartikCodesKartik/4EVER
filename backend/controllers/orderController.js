import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"

const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address} = req.body
        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, {cartData: {}})

        res.json({success: true, message: "Order Placed"})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Placing orders using stripe method
const placeOrderStripe = async (req, res) => {

}

// Placing orders using Razorpay method
const placeOrderRazorpay = async (req, res) => {

}

// All orders data for admin panel
const allOrders = async (req, res) => {
    try{
        const orders = await orderModel.find({})
        res.json({success: true, orders})
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// User order data for frontend
const userOrders = async (req, res) => {
    try{
        const {userId} = req.body
        const orders = await orderModel.find({userId})
        res.json({success: true, orders})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Update order status
const updateStatus = async (req, res) => {
    try{
        const {orderId, status} = req.body
        await orderModel.findByIdAndUpdate(orderId, {status})
        res.json({success: true, message: "Order Status Updated"})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
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
  
      // Delete the order
      await orderModel.findByIdAndUpdate(orderId, { status: 'Cancelled', isCancelled: true });

  
      res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
      console.error("Cancel Order Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  
  
  

export {placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, updateStatus, userOrders,cancelOrder}