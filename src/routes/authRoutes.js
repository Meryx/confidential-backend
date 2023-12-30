import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/request-reset-password", authController.requestResetPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/reset-email", authController.changeEmail);

export default router;
