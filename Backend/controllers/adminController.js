const Admin = require('../models/adminModel');
const Course = require('../models/courseModel')
const jwt = require('jsonwebtoken');
const {response} = require("express");
const nodemailer = require('nodemailer');
const SECRET = 'SECr3t';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'testing4dev0@gmail.com',
        pass: 'ktnt wqdi zbso eqlx'
    }
});

let otpStore = {};

exports.signup = (req, res) => {
    const { username, password } = req.body;

    function callback(admin) {
        if (admin) {
            res.status(403).json({ message: "Admin already exists."})
        } else {
            const obj = { username: username, password: password};
            const newInstructor = new Admin(obj);
            newInstructor.save();
            const token = jwt.sign({username, role: 'instructor'}, SECRET, {expiresIn: '1h'});
            res.json({ message: 'Admin created successfully', token});
        }
    }

    Admin.findOne({username}).then(callback);
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (admin) {
        if (admin.password === password) {
            const token = jwt.sign({ username, role: 'admin'}, SECRET, {expiresIn: '1h'});
            res.json({ message: 'Logged in successfully', token});
        } else {
            res.status(403).json({ message: 'Invalid password.'});
        }
    } else {
        res.status(403).json({ message: 'Username not found.'});
    }
}

exports.courses = async (req, res) => {
    const course = new Course(req.body);
    await course.save()
    res.json({ message: 'Course created successfully', courseId: course.id });
}

exports.updateCourse = async (req, res) => {
    const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
    if(course) {
        res.json({ message: 'Course updated successfully' });
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
}

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json({ courses });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching courses' });
    }
}

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


exports.verifyOtp = (req, res) => {
    const { username, otp } = req.body;

    if (otpStore[username] === otp) {
        const token = jwt.sign({ username, role: 'admin' }, SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'OTP verified', token });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
};