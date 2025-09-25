import { Router } from "express";
import { authMiddleware } from "../Middlewares/auth.middleware.js";
import LockerController from "../Controllers/locker.js";
import lockerMiddleWare from "../Middlewares/lockerMiddleWare.js";

const lockerRouter = Router();

lockerRouter.get("/get-all", authMiddleware, LockerController.getAllLockers);
lockerRouter.get("/get-by-user-id", authMiddleware, LockerController.getMyLockers);
lockerRouter.post("/buy", authMiddleware, LockerController.buyLocker);
lockerRouter.post("/open", authMiddleware,lockerMiddleWare, LockerController.openLocker);
lockerRouter.post("/close", authMiddleware,lockerMiddleWare, LockerController.closeLocker);
lockerRouter.post("/verify-otp", authMiddleware, LockerController.verifyLockerOTP);
lockerRouter.post("/send-otp", authMiddleware, LockerController.sendLockerOTP);
lockerRouter.get("/get-by-locker-id", authMiddleware, LockerController.getLocker);
lockerRouter.post("/empty", authMiddleware, lockerMiddleWare, LockerController.emptyLocker);

export default lockerRouter;