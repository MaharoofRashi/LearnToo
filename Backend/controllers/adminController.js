const Admin = require('../models/adminModel');
const Course = require('../models/courseModel')
const jwt = require('jsonwebtoken');
const {response} = require("express");
const nodemailer = require('nodemailer');
const SECRET = 'SECr3t';
const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const multer = require('multer');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'testing4dev0@gmail.com',
        pass: 'ktnt wqdi zbso eqlx'
    }
});

let otpStore = {};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching users' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, { isBlocked: req.body.isBlocked }, { new: true });
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while updating user status' });
    }
};

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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

exports.courses = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            upload.single('courseImage')(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(req.body, req.file);
        const course = new Course({...req.body, image: req.file.path});
        await course.save()
        return res.json({ message: 'Course created successfully', courseId: course.id });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.uploadCourseImage = (req, res, next) => {
    upload.single('courseImage')(req, res, function (error) {
        if (error instanceof multer.MulterError) {
            return res.status(500).json({ message: error.message });
        } else if (error) {
            return res.status(500).json({ message: error.message });
        }
        next();
    });
};

exports.updateCourse = async (req, res) => {

    const updateData = req.body;
    if (req.file) {
        updateData.image = req.file.path;
    }
    const course = await Course.findByIdAndUpdate(req.params.courseId, updateData, { new: true });
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

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while deleting the course' });
    }
};

exports.publishCourse = async (req, res) => {
    try {
        const course = await Course.updateOne({_id: req.params.courseId}, {$set: {published: true}} );
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while publishing course.'})
    }
}

exports.unpublishCourse = async (req, res) => {
    try {
        const course = await Course.updateOne({_id: req.params.courseId}, {$set: {published: false}} );
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while unpublishing course.'})
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


exports.verifyOtp = async (req, res) => {
    const { username, otp } = req.body;

    if (otpStore[username] === otp) {
        const admin = await Admin.findOne({ username });
        if (admin) {
            const token = jwt.sign({ username, role: 'admin' }, SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'OTP verified', token });
        } else {
            res.status(400).json({ message: 'User is not an admin or does not exist' });
        }
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
};

exports.createCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const existingCategory = await Category.findOne({ name: name});
        if(existingCategory) {
            return res.status(400).json({ message: "Category already exists." });
        }
        let category = new Category({ name });
        category = await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getCategory = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByIdAndUpdate(id, { name: req.body.name }, { new: true});
        if(!category){
            res.status(404).json({ message: "Category not found"})
        } else {
            res.status(200).json(category);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByIdAndDelete(id);
        if(!category){
            res.status(404).json({ message: "Category not found"})
        } else {
            res.status(200).json({ message: "Category deleted successfully"})
        }
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
}