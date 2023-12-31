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
const Order =  require('../models/orderModel');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const Report = require('../models/reportCourseModel');

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
        id: req.user.id,
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
    const normalizedName = name.toLowerCase().replace(/\s+/g, '');

    try {
        const categories = await Category.find({});
        const existingCategory = categories.find(category =>
            category.name.toLowerCase().replace(/\s+/g, '') === normalizedName
        );

        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists." });
        }

        let category = new Category({ name });
        category = await category.save();

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
    const newName = req.body.name;
    const normalizedName = newName.toLowerCase().replace(/\s+/g, '');

    try {
        const categories = await Category.find({ _id: { $ne: id } });
        const existingCategory = categories.find(category =>
            category.name.toLowerCase().replace(/\s+/g, '') === normalizedName
        );

        if (existingCategory) {
            return res.status(400).json({ message: "Another category with the same name already exists." });
        }

        const category = await Category.findByIdAndUpdate(id, { name: newName }, { new: true });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "An error occurred during the update." });
    }
};

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
        'pdf': 'application/pdf'
    };

    return mimeTypes[extension] || 'application/octet-stream';
}


const uploadLesson = multer({ storage: multer.memoryStorage() });

exports.addLesson = async (req, res) => {
    uploadLesson.single('file')(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        try {
            const selectedType = req.body.fileType;
            const fileType = req.file.mimetype.split('/')[1];

            if ((selectedType === 'video' && fileType !== 'mp4') ||
                (selectedType === 'pdf' && fileType !== 'pdf')) {
                return res.status(400).json({ message: 'File type does not match the selected type' });
            }

            const fileName = `${req.body.title.replace(/\s+/g, '-')}-${Date.now()}.${fileType}`;
            const fileUrl = await uploadToS3(req.file, fileName);

            const lesson = new Lesson({
                title: req.body.title,
                description: req.body.description,
                fileUrl,
                fileType,
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

    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        if (title) lesson.title = title;
        if (description) lesson.description = description;

        uploadLesson.single('file')(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            if (req.file) {
                const selectedType = req.body.fileType;
                const fileType = req.file.mimetype.split('/')[1];

                if ((selectedType === 'video' && fileType !== 'mp4') ||
                    (selectedType === 'pdf' && fileType !== 'pdf')) {
                    return res.status(400).json({ message: 'File type does not match the selected type' });
                }

                if (lesson.fileUrl) {
                    const oldFileName = lesson.fileUrl.split('/').pop();
                    const deleteParams = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: `uploads/${oldFileName}`,
                    };
                    await s3Client.send(new DeleteObjectCommand(deleteParams));
                }

                const safeTitle = title ? title.replace(/\s+/g, '-') : lesson.title.replace(/\s+/g, '-');
                const fileName = `${safeTitle}-${Date.now()}.${fileType}`;
                const fileUrl = await uploadToS3(req.file, fileName);

                lesson.fileUrl = fileUrl;
                lesson.fileType = fileType;
            } else {
                console.log('No file to update.');
            }

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

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name').populate('courses', 'title price');
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error });
    }
}

exports.getDailySalesReport = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sales = await Order.aggregate([
            { $match: { orderDate: { $gte: today, $lt: tomorrow } } },
            { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        res.json({ sales: sales[0] ? sales[0] : { totalSales: 0, count: 0 } });
    } catch (error) {
        res.status(500).json({ message: "Error fetching daily sales report", error });
    }
};



exports.getWeeklySalesReport = async (req, res) => {
    try {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);

        const sales = await Order.aggregate([
            { $match: { orderDate: { $gte: startOfWeek } } },
            { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        res.json({ sales: sales[0] });
    } catch (error) {
        res.status(500).json({ message: "Error fetching weekly sales report", error });
    }
};

exports.getMonthlySalesReport = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const sales = await Order.aggregate([
            { $match: { orderDate: { $gte: startOfMonth } } },
            { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        res.json({ sales: sales[0] });
    } catch (error) {
        res.status(500).json({ message: "Error fetching monthly sales report", error });
    }
};


exports.getYearlySalesReport = async (req, res) => {
    try {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        const sales = await Order.aggregate([
            { $match: { orderDate: { $gte: startOfYear } } },
            { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        res.json({ sales: sales[0] });
    } catch (error) {
        res.status(500).json({ message: "Error fetching yearly sales report", error });
    }
};


exports.getSalesReportByInterval = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = new Date(startDate);
        let end = new Date(endDate);
        end.setDate(end.getDate() + 1);

        const sales = await Order.aggregate([
            { $match: { orderDate: { $gte: start, $lt: end } } }, // Use $lt for 'end'
            { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        res.json({ sales: sales[0] ? sales[0] : { totalSales: 0, count: 0 } });
    } catch (error) {
        res.status(500).json({ message: "Error fetching sales report for the selected interval", error });
    }
};


function getDailyDateRange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { startDate: today, endDate: tomorrow };
}

function getWeeklyDateRange() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    return { startDate: startOfWeek, endDate: endOfWeek };
}

function getMonthlyDateRange() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startDate: startOfMonth, endDate: endOfMonth };
}

function getYearlyDateRange() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear() + 1, 0, 0);
    return { startDate: startOfYear, endDate: endOfYear };
}


exports.downloadSalesReport = async (req, res) => {
    try {
        const { reportType, startDate, endDate } = req.query;
        let dateRange;

        if (reportType === 'interval') {
            dateRange = {
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            };
            dateRange.endDate.setDate(dateRange.endDate.getDate() + 1);
        } else {
            switch (reportType) {
                case 'daily':
                    dateRange = getDailyDateRange();
                    break;
                case 'weekly':
                    dateRange = getWeeklyDateRange();
                    break;
                case 'monthly':
                    dateRange = getMonthlyDateRange();
                    break;
                case 'yearly':
                    dateRange = getYearlyDateRange();
                    break;
                default:
                    return res.status(400).json({ message: "Invalid report type" });
            }
        }

        const salesData = await Order.find({
            orderDate: {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            }
        }).populate('courses');

        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="sales-report-${moment(startDate).format('YYYYMMDD')}-${moment(endDate).format('YYYYMMDD')}.pdf"`
            });
            res.end(pdfData);
        });

        doc.fontSize(16).text('Sales Report', { underline: true });
        doc.moveDown();

        salesData.forEach(order => {
            doc.fontSize(12).text(`Order ID: ${order._id}`);
            doc.text(`Date: ${moment(order.orderDate).format('YYYY-MM-DD')}`);
            doc.text(`Total Amount: ${order.totalAmount}`);
            order.courses.forEach(course => {
                doc.text(`Course: ${course.title}`);
            });
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error creating PDF:', error);
        res.status(500).json({ message: "Error creating sales report for download", error });
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find({}).populate('userId', 'username').populate('courseId', 'title');
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
};

exports.updateReportStatus = async (req, res) => {
    const { reportId, status } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
        return res.status(404).json({ message: 'Report not found.' });
    }

    report.status = status;
    await report.save();

    if (status === 'accepted') {
        const course = await Course.findById(report.courseId);
        if (course) {
            course.published = false;
            await course.save();
        }
    }
    res.json({ message: `Report status updated to ${status}.` });
};



exports.subscriptions = async (req, res) => {
    try {
        const orders = await Order.find({ paymentStatus: 'Completed' })
            .populate('userId', 'name')
            .populate('courses', 'title');

        let totalEarnings = 0;
        let coursePurchaseCounts = {};

        const subscriptions = orders.map(order => {
            totalEarnings += order.totalAmount;
            order.courses.forEach(course => {
                if (!coursePurchaseCounts[course._id]) {
                    coursePurchaseCounts[course._id] = { count: 0, title: course.title };
                }
                coursePurchaseCounts[course._id].count += 1;
            });

            return {
                subscriptionId: order._id,
                userId: order.userId._id,
                userName: order.userId.name,
                courses: order.courses.map(course => course.title).join(", "),
                amount: order.totalAmount,
                orderDate: order.orderDate
            };
        });

        res.json({
            success: true,
            data: subscriptions,
            totalEarnings,
            coursePurchaseCounts
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).send('Failed to fetch subscriptions. Please try again later.');
    }
};
