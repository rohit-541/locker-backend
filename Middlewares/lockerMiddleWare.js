import jwt from "jsonwebtoken";
import db from "../Utils/db.js";

const lockerMiddleWare = async (req, res, next) => {
    const lockerToken = req.cookies.locker_token;
    if(!lockerToken){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(lockerToken, process.env.JWT_SECRET);
    if(!decoded){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const locker = await db.locker.findUnique({
        where: { id: decoded.lockerId }
    });
    if(!locker){
        return res.status(401).json({ message: "Unauthorized" });
    }
    if(locker.userId !== decoded.userId){
        return res.status(401).json({ message: "Unauthorized" });
    }

    req.lockerId = decoded.lockerId;
    req.userId = decoded.userId;
    next();
}

export default lockerMiddleWare;