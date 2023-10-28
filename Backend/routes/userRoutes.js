const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJwt = require('../middleware/authenticateJwt');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/courses', authenticateJwt, userController.getCourses);
router.post('/courses/:courseId', authenticateJwt, userController.purchaseCourse);
router.get('/purchasedCourses', authenticateJwt, userController.getPurchasedCourses);

module.exports = router;