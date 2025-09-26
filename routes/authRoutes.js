// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout);
router.get('/profile', authCtrl.profile);
module.exports = router;
