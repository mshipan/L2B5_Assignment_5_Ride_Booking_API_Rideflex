import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import { envVars } from "./app/config/env";
import passport from "passport";
import "./app/config/passport";

const app: Application = express();
dotenv.config();

const corsConfig = {
  origin: ["http://localhost:5173", "http://localhost:5174", "*"],
  credentials: true,
  optionSuccessStatus: 200,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
};

// Middlewares
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(cors(corsConfig));
app.options("", cors(corsConfig));

// Root Route
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Rideflex App Server");
});

// Routes
app.use("/api/v1", router);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
