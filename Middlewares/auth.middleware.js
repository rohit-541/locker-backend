import jwt from "jsonwebtoken";
import db from "../Utils/db.js";

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.access_token;
    if(!token){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const dbUser = await db.user.findUnique({
        where: { email: decoded.email }
    });
    if(!dbUser){
        return res.status(401).json({ message: "Unauthorized" });
    }
    req.email = decoded.email;
    req.userId = decoded.userId;
    next();
}