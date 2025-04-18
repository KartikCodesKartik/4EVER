import express from 'express'
import { loginUser, registerUser, adminLogin,verifyEmail } from '../controllers/userController.js'

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/verify-email', verifyEmail); 
userRouter.post('/admin', adminLogin)

export default userRouter;