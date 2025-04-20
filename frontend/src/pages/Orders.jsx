import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import ConfirmationModal from './ConfirmationModal';

const Orders = () => {
  const { backendUrl, token, currency, cancelOrder } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Helper function to render the quantity in a readable way
  const renderQuantity = (quantity) => {
    if (typeof quantity === 'object') {
      return Object.entries(quantity)
        .map(([size, qty]) => `${size}: ${qty}`)
        .join(', ');
    }
    return quantity;
  };

  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        `${backendUrl}/api/order/userOrders`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        let allOrderItems = [];

        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            allOrderItems.push({
              ...item,
              status: order.status,
              payment: order.amount,
              paymentMethod: order.paymentMethod,
              date: order.date,
              orderId: order._id,
              firstImage: item.images?.[0] || '/placeholder.png', // ✅ FIXED
            });
          });
        });

        setOrderData(allOrderItems.reverse());
      } else {
        console.log("No orders found or error in response");
      }
    } catch (error) {
      console.error("Error loading order data:", error);
    }
  };

  const handleCancelOrder = (orderId) => {
    setOrderToCancel(orderId);
    setIsModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (orderToCancel) {
      await cancelOrder(orderToCancel);
      setIsModalOpen(false);
      loadOrderData();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
          orderData.slice(0, 8).map((item, index) => (
            <div
              key={index}
              className="py-4 border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-start gap-6 text-sm">
                <img
                  className="w-16 sm:w-20"
                  src={item.firstImage || '/placeholder.png'}
                  alt={item.name || 'Product image'}
                />
                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                    <p>{currency}{item.payment}</p>
                    <p>Quantity: {renderQuantity(item.quantity)}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className="mt-1">
                    Date:{' '}
                    <span className="text-gray-400">
                      {item.date ? new Date(item.date).toDateString() : 'N/A'}
                    </span>
                  </p>
                  <p className="mt-1">
                    Payment:{' '}
                    <span className="text-gray-400">
                      {item.paymentMethod || 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="min-w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-sm md:text-base">{item.status}</p>
                </div>
                <button
                  onClick={() => handleCancelOrder(item.orderId)}
                  disabled={item.status === 'Cancelled'}
                  className={`border px-4 py-2 text-sm font-medium rounded-sm ${
                    item.status === 'Cancelled'
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
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

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmCancelOrder}
      />
    </div>
  );
};

export default Orders;
