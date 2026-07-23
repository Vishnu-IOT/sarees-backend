const User = require("../models/User");
const bcrypt = require("bcrypt");

// GET /users - Get all admin users
async function GetUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
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

// GET /users/:id - Get single user by ID
async function GetUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
    });
  }
}

// POST /users - Create new admin user
async function CreateUser(req, res) {
  try {
    const { name, email, phoneNo, password, role, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check existing email
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Phone number fallback if missing or empty
    const cleanPhone = phoneNo ? phoneNo.replace(/\D/g, "").slice(0, 10) : "";
    const finalPhone = cleanPhone.length === 10 ? cleanPhone : `${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phoneNo: finalPhone,
      password: hashedPassword,
      role: role || "Admin",
      status: status || "Active",
    });

    const userJson = user.toJSON();
    delete userJson.password;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userJson,
    });
  } catch (err) {
    console.error("CreateUser Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create user",
    });
  }
}

// PUT /users/:id - Update admin user
async function UpdateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phoneNo, password, role, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let updatedPassword = user.password;
    if (password && password.trim()) {
      updatedPassword = await bcrypt.hash(password.trim(), 10);
    }

    let finalPhone = user.phoneNo;
    if (phoneNo) {
      const cleanPhone = phoneNo.replace(/\D/g, "").slice(0, 10);
      if (cleanPhone.length === 10) {
        finalPhone = cleanPhone;
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      phoneNo: finalPhone,
      password: updatedPassword,
      role: role || user.role,
      status: status || user.status,
    });

    const userJson = user.toJSON();
    delete userJson.password;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userJson,
    });
  } catch (err) {
    console.error("UpdateUser Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update user",
    });
  }
}

// DELETE /users/:id - Delete admin user
async function DeleteUser(req, res) {
  try {
    const { id } = req.params;

    const deleted = await User.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
}

module.exports = {
  GetUsers,
  GetUserById,
  CreateUser,
  UpdateUser,
  DeleteUser,
};
