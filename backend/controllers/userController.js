import userModel from "../models/userModel.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from "../utils/sendEmail.js";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}
// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success:false, message: "User doesn't exists"})
        }

        if (!user.isVerified) {
            return res.json({ success: false, message: "Please verify your email before login" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success:false, message: "Invalid password" });
        }
        else{
            const token = createToken(user._id);
            res.json({ success: true, token: token });
        }
        
    }
    catch (err) {
        console.error(err);
        res.json({ success: false, message: error.message });
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await userModel.findOne({ email });
        if (exists) return res.json({ success: false, message: "User already exists" });

        if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
        if (password.length < 8) return res.json({ success: false, message: "Weak password" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const newUser = new userModel({ name, email, password: hashedPassword, verificationToken });
        await newUser.save();

        const verificationLink = `${process.env.SERVER_URL}/api/user/verify-email?token=${verificationToken}&email=${email}`;
        const html = `<h3>Verify your email</h3><p>Click <a href="${verificationLink}">here</a> to verify.</p>`;

        await sendEmail(email, "Verify your email", html);

        res.json({ success: true, message: "Registered! Check your email for verification link." });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// controller/verifyEmail.js
const verifyEmail = async (req, res) => {
    try {
        const { token, email } = req.query;

        const user = await userModel.findOne({ email, verificationToken: token });

        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL}/emfail`);
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
    } catch (error) {
        console.error(error);
        return res.redirect(`${process.env.CLIENT_URL}/emfail`);
    }
};



// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { loginUser, registerUser, adminLogin,verifyEmail };