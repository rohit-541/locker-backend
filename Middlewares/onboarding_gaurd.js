import jwt from "jsonwebtoken";
import db from "../Utils/db.js";

export const onboardingGaurd = async (req, res, next) => {
    const token = req.cookies.onboarding_token;

    if(!token){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded){
        return res.status(401).json({ message: "Unauthorized" });
    }
    req.email = decoded.email;
    next();
}