import bcrypt from "bcrypt";
import db from "../Utils/db.js";
import { sendEmail } from "../Utils/mail.js";
import jwt from "jsonwebtoken";

const AuthController = {

    //Send OTP to email in reqBody
    sendOTP: async (req, res) => {
        const { email } = req.body;
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
        try {
            
            const validTill = new Date(Date.now() + 120 * 1000);
            const encryptedOtp = await bcrypt.hash(otp,10);
            const otpObject = await db.otp.upsert({
                where: { email },
                update: { otp: encryptedOtp, validTill },
                create: { email, otp: encryptedOtp, validTill }
            });
    
            await sendEmail(email, "OTP for registration", `Your OTP for registration is ${otp}`);
    
            res.status(200).json({ message: "OTP sent successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    //Verify OTP in reqBody
    verifyOTP: async (req, res) => {
        try {   
            const { email, otp } = req.body;
            const dbOTP = await db.otp.findUnique({
                where: { email }
            });
        
            if(!dbOTP){
                return res.status(400).json({ message: "Invalid OTP" });
            }
            if(dbOTP.validTill < new Date()){
                return res.status(400).json({ message: "OTP expired" });
            }
            const result = await bcrypt.compare(`${otp}`, dbOTP.otp);    

            if(result){
                const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

                res.cookie("onboarding_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 3600000 });
                
                return res.status(200).json({ message: "OTP verified successfully" });
            }
            return res.status(400).json({ message: "Invalid OTP" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    register: async (req, res) => {

        if(!req?.body?.name || !req?.body?.password || !req?.body?.mobile){
            return res.status(400).json({ message: "Name, password and mobile are required" });
        }

        const { name, password, mobile } = req.body;
        const {email} = req;
        if(!email){
            return res.status(400).json({ message: "Email not found" });
        }

        try {
            const encryptedPassword = await bcrypt.hash(password, 10);
            const user = await db.user.create({
                data: { name,email, password: encryptedPassword ,mobile}
            }); 
            await sendEmail(email, "Registration successful", `Your registration is successful`);
            res.status(201).json({ message: "User registered successfully",user: user });
        } catch (error) {
            if(error.code === "P2002"){
                return res.status(400).json({ message: "Email already exists" });
            }
            throw error;
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await db.user.findUnique({
                where: { email }
            });

            if(!user){
                return res.status(400).json({ message: "User not found" });
            }
            
            const result = await bcrypt.compare(password, user.password);
            if(!result){
                return res.status(400).json({ message: "Invalid password" });
            }
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

            res.cookie("access_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 3600000 });

            res.status(200).json({ message: "Login successful",user: user });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    logout: async (req, res) => {
        res.clearCookie("access_token");
        res.status(200).json({ message: "Logout successful" });
    },

    me: async (req, res) => {
        try {
            const {email} = req;
            const user = await db.user.findUnique({
                where: { email }
            });
            return res.status(200).json({ message: "User found",user: user });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        } 
    }
}

export default AuthController;