const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJwt = require('../middleware/authenticateJwt');
const adminController = require("../controllers/adminController");

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/courses', authenticateJwt, userController.getCourses);
router.post('/courses/:courseId', authenticateJwt, userController.purchaseCourse);
router.post('/request-otp', userController.requestOtp);
router.post('/verify-otp', userController.verifyOtp);
router.get('/purchasedCourses', authenticateJwt, userController.getPurchasedCourses);

module.exports = router;