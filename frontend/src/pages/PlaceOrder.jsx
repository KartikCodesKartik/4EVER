import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const { getCartAmount, token, cartItems, food_list, setCartItems, backendUrl } = useContext(ShopContext);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', city: '', state: '', zip: '' });
  const [method, setMethod] = useState('cod');
  const navigate = useNavigate();
  const delivery_fee = 2;

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const orderItems = Object.entries(cartItems).map(([id, quantity]) => ({
        _id: id,
        quantity
      }));

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        userId: token,
        paymentMethod: method
      };

      if (method === 'cod') {
        const response = await axios.post(`${backendUrl}/api/order/place`, orderData, { headers: { token } });
        if (response.data.success) {
          setCartItems({});
          navigate('/orders');
        } else toast.error(response.data.message);
      }

      else if (method === 'razorpay') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error("Failed to load Razorpay SDK. Please try again.");
          return;
        }

        const res = await axios.post(`${backendUrl}/api/order/razorpay`, orderData, { headers: { token } });
        const { order } = res.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "E-Shop",
          description: "Test Transaction",
          order_id: order.id,
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(`${backendUrl}/api/order/verify-razorpay`, {
                ...orderData,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                payment: true
              }, { headers: { token } });

              if (verifyRes.data.success) {
                setCartItems({});
                navigate('/orders');
              } else {
                toast.error(verifyRes.data.message);
              }
            } catch (err) {
              toast.error(err.message);
            }
          },
          theme: { color: "#000" },
          prefill: {
            name: formData.name,
            email: formData.email,
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="place-order">
      <form className="place-order-form" onSubmit={onSubmitHandler}>
        <input type="text" name="name" placeholder="Name" onChange={onChangeHandler} required />
        <input type="email" name="email" placeholder="Email" onChange={onChangeHandler} required />
        <input type="text" name="address" placeholder="Address" onChange={onChangeHandler} required />
        <input type="text" name="city" placeholder="City" onChange={onChangeHandler} required />
        <input type="text" name="state" placeholder="State" onChange={onChangeHandler} required />
        <input type="text" name="zip" placeholder="ZIP Code" onChange={onChangeHandler} required />

        <div className="payment-method">
          <label>
            <input type="radio" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} />
            Cash on Delivery
          </label>
          <label>
            <input type="radio" value="razorpay" checked={method === 'razorpay'} onChange={() => setMethod('razorpay')} />
            Razorpay
          </label>
        </div>

        <button className="place-order-btn" type="submit">Place Order</button>
      </form>
    </div>
  );
};

export default PlaceOrder;
