import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";
import { Sequelize } from "sequelize";

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Create a token (optional at this stage)
    const token = jwt.sign({ userId: newUser.id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User created successfully",
      userId: newUser.id,
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      "your-secret-key", // Replace with a secure key
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const requestResetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).send("User not found.");
  }

  const token = jwt.sign({ userId: user.id }, "your-reset-secret", {
    expiresIn: "1h",
  });

  // Update user with reset token and expiration
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();

  res
    .status(200)
    .send("Password reset link will be sent to your email shortly.");

  await sendPasswordResetEmail(email, token);
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  // Find user by token and check if token has expired
  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        [Sequelize.Op.gt]: Date.now(), // Checks if the token is still valid
      },
    },
  });

  if (!user) {
    return res
      .status(400)
      .send("Password reset token is invalid or has expired.");
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update user's password and remove reset token
  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.send("Your password has been updated.");
};

const changeEmail = async (req, res) => {
  try {
    const { userId, newEmail, password } = req.body;

    // Find the user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Check if new email is already in use
    const emailExists = await User.findOne({ where: { email: newEmail } });
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Update the user's email
    user.email = newEmail;
    await user.save();

    res.status(200).json({ message: "Email updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating email", error: error.message });
  }
};

export default {
  signup,
  login,
  requestResetPassword,
  resetPassword,
  changeEmail,
};
