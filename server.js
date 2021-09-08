const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log(err);
    console.log('UncaughtException. Shutting Down....');
    process.exit(1);
});

dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true
}).then(() => console.log("Connected to DB"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('App running....');
});

process.on('unhandledRejection', err => {
    console.log(err);
    console.log('UnhandledRejection. Shutting Down....');
    server.close(() => {
        process.exit(1);
    });
});