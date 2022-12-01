const express = require("express");
const router = express.Router();
const { protect } = require('../controllers/authController');

const {
    addContact,
    getContact
} = require("../controllers/contactsController");


router.post("/addContact",protect, addContact);
router.get("/getContact",protect, getContact);


module.exports = router;
