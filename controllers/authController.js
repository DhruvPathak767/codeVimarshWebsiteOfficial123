import User from "../models/User.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import sendEmail from "../util/sendEmail.js";

const authController = {
  // GET: Render Forgot Password Page
  getForgotPassword: (req, res, next) => {
    res.render("auth/forgot-password", {
      pageTitle: "Forgot Password - Code Vimarsh",
      currentPage: "forgot-password",
      errorMessage: null,
      successMessage: null
    });
  },

  // POST: Handle Forgot Password Logic
  postForgotPassword: async (req, res, next) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        // Security: Don't reveal if user exists.
        return res.render("auth/forgot-password", {
          pageTitle: "Forgot Password - Code Vimarsh",
          currentPage: "forgot-password",
          errorMessage: null,
          successMessage: "If an account with that email exists, we have sent a reset link to it."
        });
      }

      // Generate Reset Token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      // Save hashed token to DB
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 Minutes
      await user.save();

      // Create Reset Link (Works for localhost/Production)
      const resetUrl = `${req.protocol}://${req.get("host")}/auth/reset-password/${resetToken}`;

      const message = `
        <h1>Password Reset Request</h1>
        <p>You have requested a password reset for your Code Vimarsh account.</p>
        <p>Please click the link below to reset your password. This link is valid for 15 minutes.</p>
        <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        <p>If you did not request this, please ignore this email.</p>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: "Password Reset Request - Code Vimarsh",
          message: message
        });

        res.render("auth/forgot-password", {
          pageTitle: "Forgot Password - Code Vimarsh",
          currentPage: "forgot-password",
          errorMessage: null,
          successMessage: "If an account with that email exists, we have sent a reset link to it."
        });

      } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        console.log(err);
        return res.status(500).render("auth/forgot-password", {
          pageTitle: "Forgot Password - Code Vimarsh",
          currentPage: "forgot-password",
          errorMessage: "Email could not be sent. Please try again later.",
          successMessage: null
        });
      }

    } catch (err) {
      console.log(err);
      res.status(500).redirect("/auth/forgot-password");
    }
  },

  // GET: Render Reset Password Page
  getResetPassword: async (req, res, next) => {
    const token = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    try {
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.render("auth/forgot-password", {
          pageTitle: "Forgot Password - Code Vimarsh",
          currentPage: "forgot-password",
          errorMessage: "Password reset token is invalid or has expired.",
          successMessage: null
        });
      }

      res.render("auth/reset-password", {
        pageTitle: "Reset Password - Code Vimarsh",
        currentPage: "reset-password",
        userId: user._id.toString(),
        passwordToken: token,
        errorMessage: null
      });

    } catch (err) {
      console.log(err);
      res.redirect("/auth/forgot-password");
    }
  },

  // POST: Handle Reset Password Logic
  postResetPassword: async (req, res, next) => {
    const { password, userId, passwordToken } = req.body;
    const hashedToken = crypto.createHash("sha256").update(passwordToken).digest("hex");

    try {
      const user = await User.findOne({
        _id: userId,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.redirect("/auth/forgot-password");
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.redirect("/signin");

    } catch (err) {
      console.log(err);
      res.redirect("/auth/forgot-password");
    }
  }
};

export default authController;
