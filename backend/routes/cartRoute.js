import express from 'express'
import { addProduct } from '../controllers/productController.js'
import authUser from '../middleware/auth.js'
import { getUserCart, updateCart,addToCart,deleteFromCart } from '../controllers/cartController.js'

const cartRouter = express.Router()

cartRouter.post('/get', authUser, getUserCart)
cartRouter.post('/add', authUser, addToCart)
cartRouter.post('/update', authUser, updateCart)
cartRouter.post('/delete', authUser, deleteFromCart)

export default cartRouter;