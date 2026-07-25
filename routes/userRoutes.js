const express = require("express");
const router = express.Router();
const {
  GetUsers,
  GetUserById,
  CreateUser,
  UpdateUser,
  DeleteUser,
  UpdateCustomer,
} = require("../controllers/userController");

router.get("/", GetUsers);
router.get("/:id", GetUserById);
router.post("/", CreateUser);
router.put("/:id", UpdateUser);
router.delete("/:id", DeleteUser);
router.post("/update-customer/:id", UpdateCustomer);

module.exports = router;
