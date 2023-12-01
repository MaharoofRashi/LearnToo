const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJwt = require('../middleware/authenticateJwt');

// Public routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/courses', userController.getCoursesByCategory);
router.post('/request-otp', userController.requestOtp);
router.post('/verify-otp', userController.verifyOtp);

// User-only routes
router.post('/courses/:courseId', authenticateJwt(['user']), userController.purchaseCourse);
router.get('/purchasedCourses', authenticateJwt(['user']), userController.getPurchasedCourses);
router.get('/course/details/:courseId', userController.getCourseById);
router.get('/course/:courseId/lessons', userController.getLessons);
router.post('/cart', authenticateJwt(['user']), userController.addToCart);
router.get('/cart', authenticateJwt(['user']), userController.getCart);
router.delete('/cart/:courseId', authenticateJwt(['user']), userController.removeFromCart);

// New User Profile routes
router.get('/profile', authenticateJwt(['user']), userController.getUserProfile);
router.put('/profile', authenticateJwt(['user']), userController.updateUserProfile);
router.post('/profile/address', authenticateJwt(['user']), userController.addAddress);
router.put('/profile/address/:addressId', authenticateJwt(['user']), userController.updateAddress);
router.delete('/profile/address/:addressId', authenticateJwt(['user']), userController.deleteAddress);
router.put('/profile/set-default-address', authenticateJwt(['user']), userController.setDefaultAddress);
router.post('/profile/education', authenticateJwt(['user']), userController.addEducation);
router.put('/profile/education/:educationId', authenticateJwt(['user']), userController.updateEducation);
router.delete('/profile/education/:educationId', authenticateJwt(['user']), userController.deleteEducation);
router.post('/create-cancellation-request', authenticateJwt(['user']), userController.createCancellationRequest);
// router.get('/check-cancellation-status/', authenticateJwt, userController.checkCancellationStatus);
router.post('/apply-coupon', authenticateJwt(['user']), userController.applyCoupon);

router.post('/create-order', authenticateJwt(['user']), userController.createOrder);
router.post('/verify-payment', authenticateJwt(['user']), userController.verifyPayment);
router.post('/clear-cart', authenticateJwt(['user']), userController.clearPurchasedCoursesFromCart);
router.get('/download-invoice/:orderId', authenticateJwt(['user']), userController.createPdf);
router.post('/create-review/:courseId', authenticateJwt(['user']), userController.createReview)
module.exports = router;