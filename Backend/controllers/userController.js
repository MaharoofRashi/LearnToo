const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Category = require('../models/categoryModel');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
const Lesson = require("../models/lessonModel");
const SECRET = 'SECr3t';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_USER_NAME,
        pass: process.env.NODEMAILER_PASSWORD
    }
});


let otpStore = {};

exports.signup = async (req, res) => {
    const { username, password, name } = req.body;
    let user = await User.findOne({ username });

    if (user) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, password: hashedPassword, name });
    await user.save();

    const token = jwt.sign(
        { id: user._id, username, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'User created successfully', token });
    delete otpStore[username];
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(403).json({ message: 'Invalid username or password.' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'User is blocked.' });
        }

        const token = jwt.sign(
            { id: user._id, username, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Logged in successfully', token });
    } else {
        res.status(403).json({ message: 'Invalid username/password or blocked by admin' });
    }
};


// exports.getCourses = async (req, res) => {
//     const courses = await Course.find({ published: true });
//     res.json({ courses });
// };

exports.getCoursesByCategory = async (req, res) => {
    try {
        const courses = await Course.find({ published: true }).populate('category', 'name');
        let coursesByCategory = {};
        courses.map(course => {
            const categoryName = course.category.name;
            if (!coursesByCategory[categoryName]) {
                coursesByCategory[categoryName] = [course];
            } else {
                coursesByCategory[categoryName].push(course);
            }
        });

        res.json({ coursesByCategory });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses by category', error });
    }
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

exports.requestOtp = (req, res) => {
    const { username } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[username] = otp;


    const mailOptions = {
        from: 'testing4dev0@gmail.com',
        to: username,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).json({ message: 'Error sending OTP' });
        } else {
            res.status(200).json({ message: 'OTP sent' });
        }
    });
};


exports.verifyOtp = async (req, res) => {
    const { username, otp } = req.body;

    if (otpStore[username] === otp) {
        res.status(200).json({ message: 'OTP verified' });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId).populate('category', 'name');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ course });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error });
    }
};

exports.getLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find({ course: req.params.courseId });
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}