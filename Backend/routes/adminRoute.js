const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateJwt = require('../middleware/authenticateJwt')
const { uploadCourseImage, updateCourse } = require('../controllers/adminController');


router.post('/signup', adminController.signup);
router.post('/login', adminController.login);
router.get('/users', authenticateJwt, adminController.getAllUsers)
router.put('/users/:userId', authenticateJwt, adminController.updateUserStatus)
router.post('/request-otp', adminController.requestOtp);
router.post('/verify-otp', adminController.verifyOtp);
router.post('/courses', authenticateJwt, adminController.courses);
// router.put('/course/:courseId', authenticateJwt, adminController.updateCourse)
router.put('/course/:courseId', authenticateJwt , uploadCourseImage, updateCourse);
router.put('/courses/:courseId/publish', authenticateJwt, adminController.publishCourse);
router.put('/courses/:courseId/unpublish', authenticateJwt, adminController.unpublishCourse);
router.get('/courses', authenticateJwt, adminController.getAllCourses);
router.get('/me', authenticateJwt, adminController.me)
router.delete('/courses/:courseId', authenticateJwt, adminController.deleteCourse);
router.post('/categories', authenticateJwt, adminController.createCategory)
router.get('/categories', authenticateJwt, adminController.getCategory);
router.put('/categories/:id', authenticateJwt, adminController.updateCategory);
router.delete('/categories/:id', authenticateJwt, adminController.deleteCategory)


module.exports = router;

