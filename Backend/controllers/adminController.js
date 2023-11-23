const Admin = require('../models/adminModel');
const Course = require('../models/courseModel')
const Lesson = require('../models/lessonModel');
const jwt = require('jsonwebtoken');
const {response} = require("express");
const nodemailer = require('nodemailer');
const SECRET = 'SECr3t';
const bcrypt = require('bcrypt');
const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const multer = require('multer');
const path = require('path');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const CancellationRequest = require('../models/cancellationModel');
const Coupon = require('../models/couponModel');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});


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

exports.signup = async (req, res) => {
    const { username, password } = req.body;

    try {
        const adminExists = await Admin.findOne({ username });
        if (adminExists) {
            return res.status(409).json({ message: "Admin already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({ username, password: hashedPassword });
        const savedAdmin = await newAdmin.save();

        const token = jwt.sign(
            { id: savedAdmin._id, username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(201).json({ message: 'Admin created successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Error creating admin.' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(404).json({ message: 'Username not found.' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(403).json({ message: 'Invalid password.' });
        }

        const token = jwt.sign(
            { id: admin._id, username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Logged in successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Login error.' });
    }
};

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

async function uploadToS3(file, fileName) {
    const mimeType = getMimeType(file.originalname);
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${fileName}`,
        Body: file.buffer,
        ContentType: mimeType,
        // ACL: 'public-read', // Make sure the file is readable by anyone
    };

    try {
        const parallelUploads3 = new Upload({
            client: s3Client,
            params: uploadParams,
        });

        parallelUploads3.on('httpUploadProgress', (progress) => {
            console.log(progress.loaded, progress.total);
        });

        await parallelUploads3.done();
        return `https://dia2leqf5pyi6.cloudfront.net/uploads/${fileName}`;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw new Error('Error uploading to S3');
    }
}

function getMimeType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        'mp4': 'video/mp4',
        'mov': 'video/quicktime',
    };

    return mimeTypes[extension] || 'application/octet-stream';
}


const uploadLesson = multer({ storage: multer.memoryStorage() });

exports.addLesson = async (req, res) => {
    uploadLesson.single('video')(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        try {
            const fileExtension = req.file.originalname.split('.').pop();
            const fileName = `${req.body.title.replace(/\s+/g, '-')}-${Date.now()}.${fileExtension}`;
            const videoUrl = await uploadToS3(req.file, fileName);

            const lesson = new Lesson({
                title: req.body.title,
                description: req.body.description,
                videoUrl,
                course: req.params.courseId
            });

            await lesson.save();
            res.status(201).json(lesson);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};


exports.getLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find({ course: req.params.courseId });
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.editLesson = async (req, res) => {
    const lessonId = req.params.lessonId;
    const { title, description } = req.body;
    console.log(title, description)

    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        // Update lesson details if provided
        if (title) lesson.title = title;
        if (description) lesson.description = description;

        // Handle the file upload first
        uploadLesson.single('video')(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            if (req.file) {

                // Delete the old video from S3 first if it exists
                if (lesson.videoUrl) {
                    const oldFileName = lesson.videoUrl.split('/').pop();
                    const deleteParams = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: `uploads/${oldFileName}`,
                    };
                    await s3Client.send(new DeleteObjectCommand(deleteParams));
                }

                // Upload the new video
                const fileExtension = req.file.originalname.split('.').pop();
                const safeTitle = lesson.title.replace(/\s+/g, '-');
                const fileName = `${safeTitle}-${Date.now()}.${fileExtension}`;
                const videoUrl = await uploadToS3(req.file, fileName);

                // Update the lesson with the new video URL
                lesson.videoUrl = videoUrl;
            } else {
                console.log('No video file to update.');
            }

            // Save the updated lesson
            await lesson.save();
            res.json({ message: 'Lesson updated successfully', lesson });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        if (lesson.videoUrl) {
            const fileName = lesson.videoUrl.split('/').pop();
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `uploads/${fileName}`
            };

            console.log('Deleting video from S3:', fileName);
            await s3Client.send(new DeleteObjectCommand(deleteParams));
        }

        await Lesson.findByIdAndDelete(req.params.lessonId);
        res.json({ message: 'Lesson and video file deleted successfully' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ message: error.message });
    }
};


exports.updateCancellationRequest = async (req, res) => {
    const { requestId, status } = req.body;

    const request = await CancellationRequest.findById(requestId);
    if (!request) {
        return res.status(404).json({ message: 'Request not found.' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
        const user = await User.findById(request.userId);
        user.purchasedCourses.pull(request.courseId);
        await user.save();
    }

    res.json({ message: `Cancellation request ${status}.` });
};


exports.getAllCancellationRequests = async (req, res) => {
    try {
        const requests = await CancellationRequest.find({}).populate('userId', 'username');
        res.json(requests);
    } catch (error) {
        console.error('Error fetching cancellation requests:', error);
        res.status(500).json({ message: 'Error fetching requests' });
    }
};


exports.createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, expiryDate, usageLimit } = req.body;
        const newCoupon = new Coupon({ code, discountType, discountValue, expiryDate, usageLimit });
        await newCoupon.save();
        res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ message: 'Error creating coupon', error });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const updateData = req.body;
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updateData, { new: true });
        if (!updatedCoupon) return res.status(404).json({ message: 'Coupon not found' });
        res.json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
    } catch (error) {
        res.status(500).json({ message: 'Error updating coupon', error });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
        if (!deletedCoupon) return res.status(404).json({ message: 'Coupon not found' });
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coupon', error });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.json({ coupons });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons', error });
    }
};

