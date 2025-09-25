import express from "express";
import lockerRouter from "./Routes/locker.routes.js";
import authRouter from "./Routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/locker", lockerRouter);

app.use("/auth", authRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});