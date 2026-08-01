const Customer = require("../models/Customer");
const Favorite = require("../models/Favourites");
const Order = require("../models/Orders");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { fn, col, Op } = require("sequelize");
const sequelize = require('../config/mysqldb');

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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
  const transaction = await sequelize.transaction();
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
    }, { transaction });

    await Customer.create({
      userId: user.id,
      name,
      email,
      phone: finalPhone,
    }, { transaction });

    const userJson = user.toJSON();
    delete userJson.password;

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userJson,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("CreateUser Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create user",
    });
  }
}

// PUT /users/:id - Update admin user
async function UpdateUser(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, email, phoneNo, password, role, status } = req.body;

    const user = await User.findByPk(id, { transaction });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingUser = await User.findOne({
      where: {
        email,
        id: {
          [Op.ne]: id,
        },
      },
    });

    if (existingUser) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const customer = await Customer.findOne({
      where: { userId: id },
      transaction,
    });

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

    await user.update(
      {
        name: name || user.name,
        email: email || user.email,
        phoneNo: finalPhone,
        password: updatedPassword,
        role: role || user.role,
        status: status || user.status,
      },
      { transaction }
    );

    if (customer) {
      await customer.update(
        {
          name: name || customer.name,
          email: email || customer.email,
          phone: finalPhone,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const userJson = user.toJSON();
    delete userJson.password;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userJson,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("UpdateUser Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update user",
    });
  }
}

// DELETE /users/:id - Delete admin user
async function DeleteUser(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const deleted = await User.destroy({
      where: { id },
      transaction,
    });

    if (!deleted) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Customer.destroy({
      where: { userId: id },
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    await transaction.rollback();

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: err.message,
    });
  }
}

async function GetCustomer(req, res) {
  try {
    const role = req.query.role || 'Customer';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = { role };

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: {
        exclude: ["password"],
        include: [
          [fn("COUNT", col("orders.id")), "orderCount"],
        ],
      },
      include: [
        {
          model: Order,
          as: "orders",
          attributes: [],
          required: false,
        },
        {
          model: Customer,
          as: "customers",
          attributes: ["id", "name", "phone", "email", "address"],
          required: false,
        },
      ],
      group: [
        "User.id",
        // ✅ ADD ALL CUSTOMER COLUMNS TO GROUP BY
        "customers.id",
        "customers.name",
        "customers.phone",
        "customers.email",
        "customers.address",
      ],
      subQuery: false,
      raw: true,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const formattedData = rows.map((user) => ({
      ...user,
      orderCount: parseInt(user.orderCount) || 0,
    }));

    return res.status(200).json({
      success: true,
      totalCustomers: count.length,
      currentPage: page,
      totalPages: Math.ceil(count.length / limit),
      role: role,
      data: formattedData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: err.message,
    });
  }
}
// GET /customers/:userId - Get all customers
async function GetCustomerById(req, res) {
  try {
    const { userId } = req.params;
    const customer = await Customer.findOne({
      where: { userId },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Customer",
    });
  }
}

// PUT /customers/:id - Update Customer
async function UpdateCustomer(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, email, phone, address, city, state, pincode } = req.body;

    const customer = await Customer.findByPk(id, { transaction });

    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const user = await User.findByPk(customer.userId, { transaction });

    // Validate email
    if (email && !isValidEmail(email)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate phone
    let finalPhone = customer.phone;

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "").slice(0, 10);

      if (cleanPhone.length !== 10) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Phone must be 10 digits",
        });
      }

      finalPhone = cleanPhone;
    }

    // Validate pincode
    if (pincode && pincode.replace(/\D/g, "").length !== 6) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Pincode must be 6 digits",
      });
    }

    // Update Customer
    await customer.update(
      {
        name: name || customer.name,
        email: email || customer.email,
        phone: finalPhone,
        address: address || customer.address,
        city: city || customer.city,
        state: state || customer.state,
        pincode: pincode || customer.pincode,
      },
      { transaction }
    );

    // Update User
    if (user) {
      await user.update(
        {
          name: name || user.name,
          email: email || user.email,
          phoneNo: finalPhone,
        },
        { transaction }
      );
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("Update Customer Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update customer",
    });
  }
}

async function GetUserProfileStats(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [likesCount, totalOrders] = await Promise.all([
      Favorite.count({ where: { userId } }),
      Order.count({ where: { userId } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        likesCount,
        totalOrders,
        dateOfJoining: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Get User Profile Stats Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile stats",
      error: err.message,
    });
  }
}

module.exports = {
  GetUsers,
  GetUserById,
  CreateUser,
  UpdateUser,
  DeleteUser,
  UpdateCustomer,
  GetCustomer,
  GetCustomerById,
  GetUserProfileStats
};
