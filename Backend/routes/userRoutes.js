const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJwt = require('../middleware/authenticateJwt');
const adminController = require("../controllers/adminController");

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/courses', userController.getCoursesByCategory);
router.post('/courses/:courseId', authenticateJwt, userController.purchaseCourse);
router.post('/request-otp', userController.requestOtp);
router.post('/verify-otp', userController.verifyOtp);
router.get('/purchasedCourses', authenticateJwt, userController.getPurchasedCourses);
router.get('/course/details/:courseId', userController.getCourseById);
router.get('/course/:courseId/lessons', userController.getLessons);

module.exports = router;