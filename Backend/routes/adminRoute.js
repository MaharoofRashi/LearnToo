const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateJwt = require('../middleware/authenticateJwt')

router.post('/signup', adminController.signup);
router.post('/login', adminController.login);
router.get('/users', authenticateJwt, adminController.getAllUsers)
router.put('/users/:userId', authenticateJwt, adminController.updateUserStatus)
router.post('/request-otp', adminController.requestOtp);
router.post('/verify-otp', adminController.verifyOtp);
router.post('/courses', authenticateJwt, adminController.courses);
router.put('/courses/:courseId', authenticateJwt, adminController.updateCourse)
router.put('/courses/:courseId/publish', authenticateJwt, adminController.publishCourse);
router.put('/courses/:courseId/unpublish', authenticateJwt, adminController.unpublishCourse);
router.get('/courses', authenticateJwt, adminController.getAllCourses);
router.get('/me', authenticateJwt, adminController.me)
router.delete('/courses/:courseId', authenticateJwt, adminController.deleteCourse);


module.exports = router;

