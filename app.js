import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import path from "path";
import { fileURLToPath } from "url";

import appRouter from "./routes/appRouter.js";
import adminRouter from "./routes/adminRouter.js";
import authRouter from "./routes/authRouter.js";
import User from "./models/User.model.js";

/* ------------------------------------------------------------------ */
/* Basic setup */
/* ------------------------------------------------------------------ */

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Required for Render / reverse proxy */
app.set("trust proxy", 1);

/* ------------------------------------------------------------------ */
/* MongoDB session store */
/* ------------------------------------------------------------------ */

const MongoStore = MongoDBStore(session);

const store = new MongoStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
});

/* ------------------------------------------------------------------ */
/* Middlewares */
/* ------------------------------------------------------------------ */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

/* Attach logged-in user to request */
app.use(async (req, res, next) => {
  if (!req.session.user) return next();

  try {
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) {
    console.error("User fetch error:", err);
    next();
  }
});

/* Global template variables */
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn || false;
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
});

/* ------------------------------------------------------------------ */
/* View engine */
/* ------------------------------------------------------------------ */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ------------------------------------------------------------------ */
/* Static files */
/* ------------------------------------------------------------------ */

app.use(express.static(path.join(__dirname, "public")));

/* ------------------------------------------------------------------ */
/* Routes */
/* ------------------------------------------------------------------ */

app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/", appRouter);

/* ------------------------------------------------------------------ */
/* Database connection */
/* ------------------------------------------------------------------ */

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

/* ------------------------------------------------------------------ */
/* Server start */
/* ------------------------------------------------------------------ */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
