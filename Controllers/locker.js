import bcrypt from "bcrypt";
import db from "../Utils/db.js";
import { sendEmail } from "../Utils/mail.js";
import jwt from "jsonwebtoken";

const LockerController = {
    sendLockerOTP: async (req, res) => {
        const {lockerId} = req.body;
        const {userId} = req;
        try {
            const locker = await db.locker.findUnique({
                where: { id: lockerId }
            });
            if(!locker){
                return res.status(400).json({ message: "Locker not found" });
            }
            if(!locker.userId || locker.userId !== userId){
                return res.status(400).json({ message: "This Locker is not assigned to you" });
            }

            const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
            const encryptedOtp = await bcrypt.hash(otp,10);
            const validTill = new Date(Date.now() + 120 * 1000);
            const user = await db.user.findUnique({
                where: { id: userId }
            });
            if(!user){
                return res.status(400).json({ message: "User not found" });
            }
            const email = user.email;   
            const otpObject = await db.lockerOTP.upsert({
                where: { userId },
                update: { otp: encryptedOtp, validTill },
                create: { lockerId, otp: encryptedOtp, validTill,userId }
            });

            await sendEmail(email, "Locker OTP", `Your locker ${locker.name} OTP is ${otp}`);
            return res.status(200).json({ message: "Locker OTP sent successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    //To verify locker OTP
    verifyLockerOTP: async (req, res) => {
        const {userId} = req;
        const {lockerId,otp} = req.body;
        try {
            const locker = await db.locker.findUnique({
                where: { id: lockerId }
            });
            if(!locker){
                return res.status(400).json({ message: "Locker not found" });
            }
            if(!locker.userId || locker.userId !== userId){
                return res.status(400).json({ message: "This Locker is not assigned to you" });
            }
            const lockerOTP = await db.lockerOTP.findUnique({
                where: { userId }
            });
            if(!lockerOTP){
                return res.status(400).json({ message: "Locker OTP not found" });
            }
            const result = await bcrypt.compare(otp, lockerOTP.otp);
            if(!result){
                return res.status(400).json({ message: "Invalid OTP" });
            }
            if(lockerOTP.validTill < new Date()){
                return res.status(400).json({ message: "OTP expired" });
            }
            const lockerToken = jwt.sign({ lockerId, userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.cookie("locker_token", lockerToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 3600000 });
            return res.status(200).json({ message: "OTP verified successfully" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    //To Open a locker
    openLocker: async (req, res) => {
        const {lockerId,userId} = req;
        try {
            const locker = await db.locker.findUnique({
                where: { id: lockerId}
            });
            if(!locker){
                return res.status(400).json({ message: "Locker not found" });
            }
            if(!locker.userId || locker.userId !== userId){
                return res.status(400).json({ message: "This Locker is not assigned to you" });
            }

            const updatedLocker = await db.locker.update({
                where: { id: lockerId },
                data: { status: "OPEN" }
            });
            const user = await db.user.findUnique({
                where: { id: userId }
            });
            if(!user){
                return res.status(400).json({ message: "User not found" });
            }
            const email = user.email;
            //Logic to open mechanical lock
            await sendEmail(email, "Locker Opened", `Your locker ${locker.name} has been opened`);
            return res.status(200).json({ message: "Locker opened successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    //To Close a locker
    closeLocker: async (req, res) => {
        const {lockerId,userId} = req;
        try {
            const locker = await db.locker.findUnique({
                where: { id: lockerId }
            });
            if(!locker){
                return res.status(400).json({ message: "Locker not found" });
            }
            if(!locker.userId || locker.userId !== userId){
                return res.status(400).json({ message: "This Locker is not assigned to you" });
            }
            const updatedLocker = await db.locker.update({
                where: { id: lockerId },
                data: { status: "CLOSED" }
            });
            const user = await db.user.findUnique({
                where: { id: userId }
            });
            if(!user){
                return res.status(400).json({ message: "User not found" });
            }
            const email = user.email;

            //Logic to close mechanical lock

            await sendEmail(email, "Locker Closed", `Your locker ${locker.name} has been closed`);
            return res.status(200).json({ message: "Locker closed successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    //To get content of the locker by lockerId
    getLocker: async (req, res) => {
        try {
            const lockerId = req.params.lockerId;
            const locker = await db.locker.findUnique({
                where: { id: lockerId }
            });
            if(!locker){
                return res.status(400).json({ message: "Locker not found" });
            }
            if(!locker.userId || locker.userId !== req.userId){
                return res.status(400).json({ message: "This Locker is not assigned to you" });
            }

            if(locker.status !== "OPEN"){
                return res.status(400).json({ message: "Locker is not open" });
            }

            return res.status(200).json({ message: "Locker found",locker });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    //To get all lockers
    getAllLockers: async (req, res) => {
        try {
            const lockers = await db.locker.findMany(
            {          
                where: {
                    status: "NONE"
                },
                select: {
                    id: true,
                    name: true,
                    prices: true,
                    status: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                }
            }
            );
            return res.status(200).json({ message: "Lockers found",lockers });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    //To get all lockers assigned to the user
    getMyLockers: async (req, res) => {
        try {
            const userId = req.userId;
            console.log(userId);
            const lockers = await db.locker.findMany({
                where: { userId },
                select:{
                    id: true,
                    name: true,
                    prices: true,
                    status: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            return res.status(200).json({ message: "Lockers found",lockers }); 
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    //Buy Locker
    buyLocker: async (req, res) => {
        const {userId} = req;
        const {lockerId} = req.body;
        try {
            const locker = await db.locker.findUnique({
                where: { id: lockerId }
            });
            if(!locker){
                return res.status(400).json({ message: "Locker not found" });
            }
            if(locker.userId || locker.status !== "NONE"){
                return res.status(400).json({ message: "This Locker is already assigned to someone or is not available" });
            }
            const updatedLocker = await db.locker.update({
                where: { id: lockerId },
                data: { userId, status: "NONE" }
            });
            return res.status(200).json({ message: "Locker bought successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

}

export default LockerController;