const express = require("express");
const router = express.Router();
const {
  GetUsers,
  GetUserById,
  CreateUser,
  UpdateUser,
  DeleteUser,
  UpdateCustomer,
  GetCustomer,
  GetCustomerById,
  GetUserProfileStats,
} = require("../controllers/userController");

router.get('/get-customer', GetCustomer)
router.post("/update-customer/:id", UpdateCustomer);
router.get('/get-customer-id/:userId', GetCustomerById);
router.get('/profile-stats/:userId', GetUserProfileStats);

router.get("/", GetUsers);
router.get("/:id", GetUserById);
router.post("/", CreateUser);
router.put("/:id", UpdateUser);
router.delete("/:id", DeleteUser);

module.exports = router;
