const Tour = require('./../models/tourModel');

exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'Success',
        requestedAt: req.requestTime,
        // results: tours.length,
        // data: {
        //     tours: tours
        // }
    })
};

exports.getTour = (req, res) => {

    // const id = req.params.id * 1;
    // const tour = tours.find(el => el.id === id);

    // res.status(200).json({
    //     status: 'Success',
    //     data: {
    //         tour: tour
    //     }
    // })
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

exports.updateTour = (req,res) => {

    const id = req.params.id * 1;

    res.status(200).json({
        status: 'Success',
        data: {
            tour: '<Update tour here....>'
        }
    });
};

exports.deleteTour = (req,res) => {

    const id = req.params.id * 1;
    if(id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    };

    res.status(204).json({
        status: 'Success',
        data: null
    });
};