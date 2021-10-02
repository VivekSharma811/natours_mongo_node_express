const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync( async (req, res, next) => {
    // Get tour data
    const tours = await Tour.find();

    // Build template
    //render
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    //get Data including reviews and guides
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'reviews rating user'
    });

    if(!tour) {
        return next(new AppError('No tour found'), 404);
    }

    // build template
    //render
    res.status(200)
        // .set(
        //     'Content-Security-Policy',
        //     "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
        // )
        .render('tour', {
            title: tour.name,
            tour
        });
});

exports.getLoginForm = (req, res) => {
    res
        .status(200)
        .set(
            'Content-Security-Policy',
            "connect-src 'self' https://cdsjs.cloudfare.com" 
        )
        .render('login', {
        title: 'Log into your account'
    });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'My Account'
    });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    },
    {
        new: true,
        runValidators: true
    });
    res.status(200).render('account', {
        title: 'My Account',
        user: user
    });

});