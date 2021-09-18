const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoute');
const AppError = require('./utils/appError');

const app = express();

// Middlewares

// Set Security HTTP headers
app.use(helmet());

// Logging for dev env
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests. Please try again later'
});

app.use('/api', limiter);

// Body parser
app.use(express.json());

// Data Sanitization against NoSQL Query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

//Prevent Parameter Pollution
app.use(hpp({
    whitelist: [
        'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
    ]
}));

//Serving static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

//Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
