const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateJwt = require('../middleware/authenticateJwt')
const { uploadCourseImage, updateCourse } = require('../controllers/adminController');
const {fetchChatHistory} = require('../common/chatUtils')

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

router.get('/sales/daily', authenticateJwt(['admin']), adminController.getDailySalesReport);
router.get('/sales/weekly', authenticateJwt(['admin']), adminController.getWeeklySalesReport);
router.get('/sales/monthly', authenticateJwt(['admin']), adminController.getMonthlySalesReport);
router.get('/sales/yearly', authenticateJwt(['admin']), adminController.getYearlySalesReport);
router.get('/sales/interval', authenticateJwt(['admin']), adminController.getSalesReportByInterval);
router.get('/sales/download', authenticateJwt(['admin']), adminController.downloadSalesReport);

router.post('/update-report-status', authenticateJwt(['admin']), adminController.updateReportStatus);
router.get('/report-requests', authenticateJwt(['admin']), adminController.getAllReports);

router.get('/chat-history/:courseId', authenticateJwt(['admin']), fetchChatHistory);

router.get('/subscriptions', authenticateJwt(['admin']), adminController.subscriptions);
module.exports = router;

