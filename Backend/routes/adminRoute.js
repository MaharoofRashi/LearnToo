const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateJwt = require('../middleware/authenticateJwt')

router.post('/signup', adminController.signup);
router.post('/login', adminController.login);
router.post('/courses', authenticateJwt, adminController.courses);
router.put('/courses/:courseId', authenticateJwt, adminController.updateCourse)
router.get('/courses', authenticateJwt, adminController.getAllCourses);


module.exports = router;

