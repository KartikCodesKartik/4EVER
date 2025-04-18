import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 100;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");

  const navigate = useNavigate();

  // --------------------- CART FUNCTIONS ---------------------

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    setCartItems((prevCart) => {
      const updatedCart = { ...prevCart };
      if (!updatedCart[itemId]) updatedCart[itemId] = {};
      if (!updatedCart[itemId][size]) updatedCart[itemId][size] = 0;
      updatedCart[itemId][size] += 1;
      return updatedCart;
    });

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId, size },
          { headers: { token } }
        );
        navigate("/cart");
      } catch (error) {
        console.log(error);
        toast.error(error.message || "Failed to sync cart");
      }
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    if (quantity < 1) return;

    const cartData = structuredClone(cartItems);

    if (cartData[itemId] && cartData[itemId][size] !== undefined) {
      cartData[itemId][size] = quantity;
      setCartItems(cartData);

      if (token) {
        try {
          await axios.post(
            `${backendUrl}/api/cart/update`,
            { itemId, size, quantity },
            { headers: { token } }
          );
        } catch (error) {
          console.log(error);
          toast.error(error.message || "Failed to update quantity");
        }
      }
    }
  };

  const deleteFromCart = async (itemId, size) => {
    const updatedCart = structuredClone(cartItems);

    if (size && updatedCart[itemId]?.[size]) {
      delete updatedCart[itemId][size];
      if (Object.keys(updatedCart[itemId]).length === 0) {
        delete updatedCart[itemId];
      }
    } else if (!size && updatedCart[itemId]) {
      delete updatedCart[itemId];
    }

    setCartItems(updatedCart);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/delete`,
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token } }
      );

      if (response.data.success && response.data.cart) {
        const cartArray = response.data.cart;
        const transformedCart = {};

        for (const item of cartArray) {
          const { productId, size, quantity } = item;
          if (!transformedCart[productId]) transformedCart[productId] = {};
          transformedCart[productId][size] = quantity;
        }

        setCartItems(transformedCart);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // --------------------- PRODUCT FUNCTIONS ---------------------

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      totalCount += Object.keys(cartItems[itemId]).length;
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = products.find((product) => product._id === itemId);
      if (!itemInfo) continue;
      for (const size in cartItems[itemId]) {
        totalAmount += itemInfo.price * (cartItems[itemId][size] || 0);
      }
    }
    return totalAmount;
  };

  // --------------------- ORDER FUNCTIONS ---------------------

  const cancelOrder = async (orderId) => {
    console.log("Id from shop context:", orderId);
    console.log("Token from shop context:", token);
    
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/cancel`,
        { orderId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        // You can trigger a refresh of the user's orders here if needed
      } else {
        toast.error(response.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  // --------------------- USE EFFECTS ---------------------

  useEffect(() => {
    const localToken = localStorage.getItem("token");
    if (localToken) {
      setToken(localToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      getUserCart(token);
    }
  }, [token]);

  useEffect(() => {
    getProductsData();
  }, []);

  // --------------------- CONTEXT VALUE ---------------------

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    updateQuantity,
    deleteFromCart,
    getCartCount,
    getCartAmount,
    navigate,
    backendUrl,
    token,
    setToken,
    setProducts,
    cancelOrder, // ✅ Added here
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
