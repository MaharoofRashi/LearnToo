const Admin = require('../models/adminModel');
const Course = require('../models/courseModel')
const jwt = require('jsonwebtoken');
const {response} = require("express");
const SECRET = 'SECr3t';

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