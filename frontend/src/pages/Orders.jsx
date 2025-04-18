import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import ConfirmationModal from './ConfirmationModal'; // Import the Modal

const Orders = () => {
  const { backendUrl, token, currency, cancelOrder } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const [orderToCancel, setOrderToCancel] = useState(null); // Store the order ID to cancel

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }
      const response = await axios.post(
        `${backendUrl}/api/order/userOrders`,
        {},
        { headers: { token } }
      );

      console.log("Response from API:", response.data);

      if (response.data.success) {
        let allOrderItems = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            item['orderId'] = order._id; // Add orderId to each item
            allOrderItems.push(item);
          });
        });

        console.log("All Order Items:", allOrderItems);
        setOrderData(allOrderItems.reverse());
      } else {
        console.log("No orders found or error in response");
      }
    } catch (error) {
      console.error("Error loading order data:", error);
    }
  };

  const handleCancelOrder = (orderId) => {
    setOrderToCancel(orderId);  // Store the orderId to be cancelled
    setIsModalOpen(true);  // Open the modal for confirmation
  };

  const confirmCancelOrder = async () => {
    if (orderToCancel) {
      await cancelOrder(orderToCancel); // Proceed with cancelling the order
      setIsModalOpen(false);  // Close the modal
      loadOrderData(); // Refresh data after cancellation
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);  // Close the modal without cancelling
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>
      <div>
        {orderData.length > 0 ? (
          orderData.slice(0, 4).map((item, index) => (
            <div key={index} className="py-4 border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-6 text-sm">
                <img className="w-16 sm:w-20" src={item.images[0]} alt="" />
                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                    <p>{currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className="mt-1">Date: <span className="text-gray-400">{new Date(item.date).toDateString()}</span></p>
                  <p className="mt-1">Payment: <span className="text-gray-400">{item.paymentMethod}</span></p>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-between">
                <div className="flex items-center gap-2">
                  <p className="min-w-2 -2 rounded-full bg-green-500"></p>
                  <p className="text-sm md:text-base">{item.status}</p>
                </div>
                <button 
                  onClick={() => handleCancelOrder(item.orderId)}
                  disabled={item.status === "Cancelled"}
                  className={`border px-4 py-2 text-sm font-medium rounded-sm ${
                    item.status === "Cancelled" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmCancelOrder}
      />
    </div>
  );
};

export default Orders;
