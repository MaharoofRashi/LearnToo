const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Category = require('../models/categoryModel');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
const Lesson = require("../models/lessonModel");
const SECRET = 'SECr3t';
const Razorpay = require('razorpay');
const crypto = require("crypto");
const CancellationRequest = require('../models/cancellationModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_USER_NAME,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
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

exports.addToCart = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        if(user.cart.includes(courseId)){
            return res.status(400).json({ message: 'Course already in cart' });
        }

        user.cart.push(courseId);
        await user.save();

        res.status(200).json({ message: 'Course added to cart', cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: 'Error adding course to cart', error });
    }
}

exports.getCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate('cart');
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
}

exports.removeFromCart = async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.cart = user.cart.filter(item => item.toString() !== courseId);
        await user.save();

        res.status(200).json({ message: 'Course removed from cart', cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: 'Error removing course from cart', error });
    }
}


exports.addAddress = async (req, res) => {
    const userId = req.user.id;
    const { street, city, state, country, zip } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newAddress = { street, city, state, country, zip };
        user.addresses.push(newAddress);
        await user.save();

        res.status(200).json({ message: 'Address added successfully', addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: 'Error adding address', error });
    }
};

exports.addEducation = async (req, res) => {
    const userId = req.user.id;
    const { degree, institution, year } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newEducation = { degree, institution, year };
        user.education.push(newEducation);
        await user.save();

        res.status(200).json({ message: 'Education added successfully', education: user.education });
    } catch (error) {
        res.status(500).json({ message: 'Error adding education', error });
    }
};


exports.getUserProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId)
            .select('-password -otp -isBlocked -cart')
            .populate('defaultAddress');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userProfile = user.toObject();
        userProfile.addresses = userProfile.addresses.map(address => ({
            ...address,
            isDefault: address._id.equals(user.defaultAddress)
        }));

        res.status(200).json({ userProfile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
};


exports.updateUserProfile = async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;
    try {
        const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
            .select('-password -otp -isBlocked -purchasedCourses -cart');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', userProfile: user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user profile', error });
    }
};

exports.updateAddress = async (req, res) => {
    const userId = req.user.id;
    const { addressId } = req.params;
    const updateData = req.body;

    try {
        const user = await User.findById(userId);
        const addressIndex = user.addresses.findIndex(address => address._id.toString() === addressId);

        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        user.addresses[addressIndex] = { ...user.addresses[addressIndex].toObject(), ...updateData };
        await user.save();

        res.status(200).json({ message: 'Address updated successfully', addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: 'Error updating address', error });
    }
};

exports.setDefaultAddress = async (req, res) => {
    const userId = req.user.id;
    const { addressId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressExists = user.addresses.some(address => address._id.toString() === addressId);
        if (!addressExists) {
            return res.status(404).json({ message: 'Address not found' });
        }

        user.defaultAddress = addressId;
        await user.save();

        res.status(200).json({ message: 'Default address set successfully', defaultAddress: addressId });
    } catch (error) {
        res.status(500).json({ message: 'Error setting default address', error });
    }
};


exports.deleteAddress = async (req, res) => {
    const userId = req.user.id;
    const { addressId } = req.params;

    try {
        const user = await User.findById(userId);
        user.addresses = user.addresses.filter(address => address._id.toString() !== addressId);
        await user.save();

        res.status(200).json({ message: 'Address deleted successfully', addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting address', error });
    }
};

exports.updateEducation = async (req, res) => {
    const userId = req.user.id;
    const { educationId } = req.params;
    const updateData = req.body;

    try {
        const user = await User.findById(userId);
        const educationIndex = user.education.findIndex(education => education._id.toString() === educationId);

        if (educationIndex === -1) {
            return res.status(404).json({ message: 'Education not found' });
        }

        user.education[educationIndex] = { ...user.education[educationIndex].toObject(), ...updateData };
        await user.save();

        res.status(200).json({ message: 'Education updated successfully', education: user.education });
    } catch (error) {
        res.status(500).json({ message: 'Error updating education', error });
    }
};

exports.deleteEducation = async (req, res) => {
    const userId = req.user.id;
    const { educationId } = req.params;

    try {
        const user = await User.findById(userId);
        user.education = user.education.filter(education => education._id.toString() !== educationId);
        await user.save();

        res.status(200).json({ message: 'Education deleted successfully', education: user.education });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting education', error });
    }
};


exports.createOrder = async (req, res) => {
    const { amount } = req.body;

    try {
        const options = {
            amount: amount,
            currency: "INR",
            receipt: "receipt#1"
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error creating Razorpay order");
    }
}

// exports.verifyPayment = async (req, res) => {
//     const { orderCreationId, razorpayPaymentId, razorpaySignature, courseId } = req.body;
//
//     const generateSignature = (orderCreationId, razorpayPaymentId) => {
//         const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//         hmac.update(`${orderCreationId}|${razorpayPaymentId}`);
//         return hmac.digest('hex');
//     };
//
//     const generatedSignature = generateSignature(orderCreationId, razorpayPaymentId);
//
//     if (generatedSignature === razorpaySignature) {
//         try {
//             const userId = req.user.id;
//             await User.findByIdAndUpdate(
//                 userId,
//                 { $addToSet: { purchasedCourses: courseId } },
//                 { new: true }
//             );
//
//             res.status(200).json({ message: "Payment verified successfully and course added to user profile" });
//         } catch (error) {
//             console.error("Error updating user's purchased courses", error);
//             res.status(500).json({ message: 'Error updating purchased courses', error: error.message });
//         }
//     } else {
//         res.status(400).json({ message: "Invalid signature sent" });
//     }
// };


exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto.createHmac('sha256', key_secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        try {
            const userId = req.user.id;
            const amount = req.body.originalAmount;
            const discountedAmount = req.body.discountedAmount;

            const newOrder = new Order({
                userId,
                courses: courseId,
                totalAmount: amount,
                discountedAmount: discountedAmount,
                transactionId: razorpay_payment_id,
                paymentStatus: 'Completed',
                orderDate: new Date()
            });
            await newOrder.save();

            await User.findByIdAndUpdate(userId, { $addToSet: { purchasedCourses: courseId } });
            res.status(200).json({ verified: true, message: "Payment verified successfully" });
        } catch (error) {
            console.error("Error in Verification:", error);
            res.status(500).json({ message: "Error updating user's purchased courses", error: error.message });
        }
    } else {
        res.status(400).json({ message: "Invalid signature sent" });
    }
};

exports.clearPurchasedCoursesFromCart = async (req, res) => {
    const userId = req.user.id;
    const purchasedCourseIds = req.body.purchasedCourseIds;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.cart = user.cart.filter(courseId => !purchasedCourseIds.includes(courseId.toString()));
        await user.save();

        res.status(200).json({ message: 'Purchased courses cleared from cart', cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing purchased courses from cart', error });
    }
};


exports.createCancellationRequest = async (req, res) => {
    const { courseId, reason } = req.body;
    const userId = req.user.id;

    const existingRequest = await CancellationRequest.findOne({
        userId,
        courseId,
        status: { $in: ['pending', 'rejected', 'accepted'] }
    });

    if (existingRequest) {
        let message = '';
        switch(existingRequest.status) {
            case 'pending':
                message = 'A cancellation request for this course is already pending.';
                break;
            case 'rejected':
                message = 'Your previous cancellation request for this course was rejected.';
                break;
            case 'accepted':
                message = 'Your cancellation request for this course has already been accepted.';
                break;
        }
        return res.status(400).json({ message });
    }

    const newRequest = new CancellationRequest({
        userId,
        courseId,
        reason,
        status: 'pending'
    });

    await newRequest.save();
    res.status(201).json({ message: 'Cancellation request submitted successfully.' });
};

// exports.checkCancellationStatus = async (req, res) => {
//     const { courseId } = req.params;
//     const userId = req.user.id;
//
//
//     try {
//         const request = await CancellationRequest.findOne({
//             userId,
//             courseId,
//             status: { $in: ['pending', 'rejected', 'accepted'] }
//         });
//
//         if (request) {
//             res.json({ status: request.status, message: 'Cancellation request found.' });
//         } else {
//             res.json({ status: 'none', message: 'No cancellation request found.' });
//         }
//     } catch (error) {
//         console.error('Error fetching cancellation status:', error);
//         res.status(500).json({ message: 'Error checking cancellation status' });
//     }
// };


exports.applyCoupon = async (req, res) => {
    const { couponCode, originalPrice } = req.body;

    try {
        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        let discountAmount;
        if (coupon.discountType === 'percentage') {
            discountAmount = (coupon.discountValue / 100) * originalPrice;
        } else {
            discountAmount = coupon.discountValue;
        }

        discountAmount = Math.min(discountAmount, originalPrice);
        coupon.usedCount += 1;
        await coupon.save();

        res.json({ discountedPrice: originalPrice - discountAmount });
    } catch (error) {
        console.error('Coupon application error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
