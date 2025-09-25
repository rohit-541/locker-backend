const LockerController = {
    sendLockerOTP: async (req, res) => {
        const {lockerId} = req.params;
        const {userId} = req.userId;

        if(!userId){
            return res.status(400).json({ message: "User not found" });
        }
        try {
            const otp = Math.floor(100000 + Math.random() * 900000);
            const validTill = new Date(Date.now() + 120 * 1000);
            const encryptedOtp = await bcrypt.hash(otp, 10);
            const lockerOTP = await db.lockerOTP.create({
                data: { lockerId, otp: encryptedOtp, validTill }
            });
            sendEmail(userId, "Locker OTP", `Your OTP for locker is ${otp}`);
            return res.status(200).json({ message: "Locker OTP sent successfully" });
        } catch (error) {
            throw error;
        }
    },
    verifyLockerOTP: async (req, res) => {
        const {lockerId,otp } = req.body;
        const {userId} = req.userId;

        if(!userId){
            return res.status(400).json({ message: "User not found" });
        }

        try {
            const lockerOTP = await db.lockerOTP.findUnique({
                where: { lockerId,userId }
            });
            if(!lockerOTP){
                return res.status(400).json({ message: "Locker OTP not found" });
            }
            if(lockerOTP.validTill < new Date()){
                return res.status(400).json({ message: "Locker OTP expired" });
            }
            const result = await bcrypt.compare(otp, lockerOTP.otp);
            if(!result){
                return res.status(400).json({ message: "Invalid OTP" });
            }
        } catch (error) {
            throw error;
        }
        

        const token = jwt.sign({ lockerId,userId: lockerOTP.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("access_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 3600000 });
        
        return res.status(200).json({ message: "Locker OTP verified successfully" });
    },

    getLocker: async (req, res) => {
        const {lockerId} = req.params;
        const {userId} = req.userId;

        if(!userId){
            return res.status(400).json({ message: "User not found" });
        }
        const locker = await db.locker.findUnique({
            where: { id: lockerId,userId }
        });
        if(!locker){
            return res.status(400).json({ message: "Locker not found" });
        }
        return res.status(200).json({ message: "Locker found",locker });
    }
}