const express = require('express');
const { Login, ListUsers, CustomerRegister, AdminLogin } = require('../controllers/authController');
const router = express.Router();

router.post('/login', Login);
router.post('/admin-login', AdminLogin);
router.post('/register', CustomerRegister);
router.get('/list-users', ListUsers);


module.exports = router;
