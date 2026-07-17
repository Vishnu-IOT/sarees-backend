const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

async function Login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User name,email and password is not found",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
}

async function Register(req, res) {
  try {
    const { name, email, phoneNo, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({
      where: {
        phoneNo,
      },
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      phoneNo,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
}

async function ListUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password"], // Hide password
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
}

module.exports = {
  Login, Register, ListUsers
};
