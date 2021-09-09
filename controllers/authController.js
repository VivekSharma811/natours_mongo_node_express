const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({ id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync( async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exist
    if(!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    //Check if user exists and pwd is correct
    const user = await User.findOne({ email }).select('+password');

    if(!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401));
    }

    //Send token back
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // Check token
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new AppError('You are not logged in', 401));
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await User.findById(decoded.id);
    if(!user) {
        return next(new AppError('User does not exist', 401));
    }

    // Check if password was changed after generating token
    if(user.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password. Please login again', 401));
    }

    req.user = user;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You are not authorised to perform this action', 403));
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // Get user from Email
    const user = await User.findOne({ email: req.body.email});
    if(!user) {
        return next(new AppError('Invalid Email', 404));
    }

    //Generate Reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //Send as Email
});

exports.resetPassword = (req, res, next) => {};