const express = require('express');
const { Login, Register, ListUsers } = require('../controllers/authController');
const router = express.Router();

router.post('/login', Login);
router.post('/register', Register);
router.get('/list-users', ListUsers);


module.exports = router;
