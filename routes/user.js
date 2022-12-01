const express = require("express");
const router = express.Router();
const { protect } = require('../controllers/authController');

const {
    register,
    login,
    logout,
    changePassword,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");


router.post("/register", register);
router.post("/login", login);
router.post("/logout",protect, logout);
router.post("/changePassword",protect, changePassword);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);



module.exports = router;
