import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

router.get("/forgot-password", authController.getForgotPassword);

router.post("/forgot-password", authController.postForgotPassword);

router.get("/reset-password/:token", authController.getResetPassword);

router.post("/reset-password", authController.postResetPassword);

export default router;
