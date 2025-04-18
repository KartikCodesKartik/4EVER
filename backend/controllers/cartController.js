import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// Add products to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body;
    
    // Check if the required fields are provided
    if (!userId || !itemId || !size) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    let cartData = userData.cartData || {};

    // Initialize the cartData object if not present
    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    // Update size quantity or initialize it to 1
    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

    // Save the updated cart data
    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user cart
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body;

    // Validate input
    if (!userId || !itemId || !size || quantity === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    let cartData = userData.cartData || {};

    // Check if the item exists in the cart
    if (!cartData[itemId] || !cartData[itemId][size]) {
      return res.status(404).json({ success: false, message: "Item or size not found in cart" });
    }

    // Update the quantity
    cartData[itemId][size] = quantity;

    // Save the updated cart data
    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user cart
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    let cartData = userData.cartData || {};

    // If the cart is empty, return an empty array or message
    if (Object.keys(cartData).length === 0) {
      return res.json({ success: true, message: "Cart is empty" });
    }

    // Get cart details including product name, price, etc.
    const cartDetails = [];
    let grandTotal = 0;

    for (const productId in cartData) {
      const product = await productModel.findById(productId);
      if (!product) continue; // Skip if product doesn't exist

      const sizeQuantities = cartData[productId];
      for (const size in sizeQuantities) {
        const quantity = sizeQuantities[size];
        const totalPrice = product.price * quantity;
        grandTotal += totalPrice;

        cartDetails.push({
          productId,
          name: product.name,
          image: product.images[0], // First image only
          size,
          quantity,
          price: product.price,
          totalPrice,
        });
      }
    }

    return res.json({
      success: true,
      cart: cartDetails,
      grandTotal,
    });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete item from user cart
const deleteFromCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body;

        // Validate input
        if (!userId || !itemId) {
            return res.status(400).json({ success: false, message: "User ID and Item ID are required" });
        }

        const userData = await userModel.findById(userId);
        if (!userData) return res.status(404).json({ success: false, message: "User not found" });

        let cartData = userData.cartData || {};

        // If size is provided, remove the specific size from the item
        if (size) {
            if (cartData[itemId] && cartData[itemId][size]) {
                delete cartData[itemId][size];
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId]; // Remove the item completely if no sizes are left
                }
            } else {
                return res.status(404).json({ success: false, message: "Size not found for this item" });
            }
        } else {
            // If size is not provided, remove the entire item from the cart
            if (cartData[itemId]) {
                delete cartData[itemId];
            } else {
                return res.status(404).json({ success: false, message: "Item not found in cart" });
            }
        }

        // Update the user cart
        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Item removed from cart successfully" });
    } catch (error) {
        console.error("Error deleting item from cart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export { addToCart, updateCart, getUserCart, deleteFromCart };
