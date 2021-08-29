const Tour = require('./../models/tourModel');

exports.aliasTopTours = async = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = async (req, res) => {

    try {
        //Filtering
        const { page, sort, limit, fields, ...queryObj } = req.query

        // Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Tour.find(JSON.parse(queryStr));

        //Sorting
        if(sort) {
            const sortBy = sort.split(',').join(' ');
            query = query.sort(sortBy)
        } 
        // else {
        //     query = query.sort('-createdAt');
        // }

        // Field Limiting

        if(fields) {
            query = query.select(fields.split(',').join(' '));
        } else {
            query = query.select('-__v');
        }

        //Pagination
        const pageNo = page*1 || 1;
        const limitNo = limit*1 || 20;
        const skip = (pageNo - 1) * limitNo;

        query = query.skip(skip).limit(limitNo);

        if(page) {
            const numTours = await Tour.countDocuments();
            if(skip >= numTours) throw new Error('This page does not exist');
        }

        // Executing Query
        const tours = await query;

        res.status(200).json({
            status: 'Success',
            results: tours.length,
            data: {
                tours: tours
            }
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};

exports.getTour = async (req, res) => {

    try {
        const tour = await Tour.findById(req.params.id)

        res.status(200).json({
            status: 'Success',
            data: {
                tour: tour
            }
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};

exports.createTour = async (req,res) => {

    try {
    
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'Success',
        data: {
            tour: newTour
        }
    });
    } catch(err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};

exports.updateTour = async (req,res) => {

    try {

        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'Success',
            data: {
                tour
            }
        });
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};

exports.deleteTour = async (req,res) => {

    try {
        await Tour.findByIdAndDelete(req.params.id)

        res.status(204).json({
            status: 'Success',
            data: null
        });
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};