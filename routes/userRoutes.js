const express = require("express");
const router = express.Router();
const {
  GetUsers,
  GetUserById,
  CreateUser,
  UpdateUser,
  DeleteUser,
} = require("../controllers/userController");

router.get("/", GetUsers);
router.get("/:id", GetUserById);
router.post("/", CreateUser);
router.put("/:id", UpdateUser);
router.delete("/:id", DeleteUser);

module.exports = router;
