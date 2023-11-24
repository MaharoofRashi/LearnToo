const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateJwt = require('../middleware/authenticateJwt')
const { uploadCourseImage, updateCourse } = require('../controllers/adminController');

// Public routes
router.post('/signup', adminController.signup);
router.post('/login', adminController.login);
router.post('/request-otp', adminController.requestOtp);
router.post('/verify-otp', adminController.verifyOtp);

// Admin-only routes
router.get('/users', authenticateJwt(['admin']), adminController.getAllUsers);
router.put('/users/:userId', authenticateJwt(['admin']), adminController.updateUserStatus);
router.post('/courses', authenticateJwt(['admin']), adminController.courses);
// router.put('/course/:courseId', authenticateJwt, adminController.updateCourse)
router.put('/course/:courseId', authenticateJwt(['admin']), uploadCourseImage, updateCourse);
router.put('/courses/:courseId/publish', authenticateJwt(['admin']), adminController.publishCourse);
router.put('/courses/:courseId/unpublish', authenticateJwt(['admin']), adminController.unpublishCourse);
router.get('/courses', authenticateJwt(['admin']), adminController.getAllCourses);
router.get('/me', authenticateJwt(['admin']), adminController.me);
router.delete('/courses/:courseId', authenticateJwt(['admin']), adminController.deleteCourse);
router.post('/categories', authenticateJwt(['admin']), adminController.createCategory);
router.get('/categories', authenticateJwt(['admin']), adminController.getCategory);
router.put('/categories/:id', authenticateJwt(['admin']), adminController.updateCategory);
router.delete('/categories/:id', authenticateJwt(['admin']), adminController.deleteCategory);
router.post('/courses/:courseId/lessons', authenticateJwt(['admin']), adminController.addLesson);
router.get('/courses/:courseId/lessons', authenticateJwt(['admin']), adminController.getLessons);
router.put('/lessons/:lessonId', authenticateJwt(['admin']), adminController.editLesson);
router.delete('/lessons/:lessonId', authenticateJwt(['admin']), adminController.deleteLesson);
router.post('/update-cancellation-request', authenticateJwt(['admin']), adminController.updateCancellationRequest);
router.get('/cancellation-requests', authenticateJwt(['admin']), adminController.getAllCancellationRequests);

router.post('/coupon', authenticateJwt(['admin']), adminController.createCoupon);
router.put('/coupon/:couponId', authenticateJwt(['admin']), adminController.updateCoupon);
router.delete('/coupon/:couponId', authenticateJwt(['admin']), adminController.deleteCoupon);
router.get('/coupons', authenticateJwt(['admin']), adminController.getAllCoupons);
router.get('/orders', authenticateJwt(['admin']), adminController.getOrders);
module.exports = router;

