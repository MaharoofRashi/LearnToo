const User = require('../models/userModel');
const Course = require('../models/courseModel');
const jwt = require('jsonwebtoken');
const SECRET = 'SECr3t';

exports.signup = async (req, res) => {
    const { username, password, name } = req.body;
    const user = await User.findOne({ username });
    if (user) {
        res.status(403).json({ message: 'User already exists' });
    } else {
        const newUser = new User({ username, password, name });
        await newUser.save();
        const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '1h' });
        res.json({ message: 'User created successfully', token });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        // Check if the user is blocked
        if (user.isBlocked) {
            return res.status(403).json({ message: 'User is blocked.' });
        }

        const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '1h' });
        res.json({ message: 'Logged in successfully', token });
    } else {
        res.status(403).json({ message: 'Invalid username or password' });
    }
};


exports.getCourses = async (req, res) => {
    const courses = await Course.find({ published: true });
    res.json({ courses });
};

exports.purchaseCourse = async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (course) {
        const user = await User.findOne({ username: req.user.username });
        if (user) {
            user.purchasedCourses.push(course);
            await user.save();
            res.json({ message: 'Course purchased successfully' });
        } else {
            res.status(403).json({ message: 'User not found' });
        }
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
};

exports.getPurchasedCourses = async (req, res) => {
    const user = await User.findOne({ username: req.user.username }).populate('purchasedCourses');
    if (user) {
        res.json({ purchasedCourses: user.purchasedCourses || [] });
    } else {
        res.status(403).json({ message: 'User not found' });
    }
};

exports.me = async (req, res) => {
    res.json({
        username: req.user.username
    })
}
