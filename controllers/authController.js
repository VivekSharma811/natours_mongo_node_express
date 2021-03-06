const cripto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
};

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

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    newUser.password = undefined;

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

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    res.status(200).json({
        status: 'success',
        token
    });
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};

exports.protect = catchAsync(async (req, res, next) => {
    // Check token
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt) {
        token = req.cookies.jwt;
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
    res.locals.user = user;
    next();
});

// Only for rendered pages with no errors
exports.isLoggedIn = async (req, res, next) => {
    try {
        if(req.cookies.jwt) {
            //verify token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    
            // Check if user exists
            const user = await User.findById(decoded.id);
            if(!user) {
                return next();
            }
    
            // Check if password was changed after generating token
            if(user.changedPasswordAfter(decoded.iat)) {
                return next();
            }
    
            // User los logged in
            res.locals.user = user;
        }
        next();
    } catch(err) {
        return next();
    }
};

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
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your Password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token',
            message
        });
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending email. Please try again.', 500));
    }
});

exports.resetPassword = catchAsync( async (req, res, next) => {

    // get User based on Token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});

    // set new password if token not expired and user exists
    if(!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log the user in
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    });
});

exports.updatePassword = catchAsync( async(req, res, next) => {
    // Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // Check if current pwd is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Current password is wrong', 401));
    }

    // Update pwd
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //Log user in
    const token = signToken(user._id);
    
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    res.status(200).json({
        status: 'success',
        token
    });
});