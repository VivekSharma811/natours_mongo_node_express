const fs = require('fs');

const express = require('express');
const { dirname } = require('path');
const { RSA_NO_PADDING } = require('constants');

const app = express();

app.use(express.json());

// app.get('/', (req, res) => {
//     res.status(200).json({message: 'Hello from server', app: 'Natours'});
// });

// app.post('/', (req, res) => {
//     res.send('You can post this endpoint');
// });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'Success',
        results: tours.length,
        data: {
            tours: tours
        }
    })
});

app.get('/api/v1/tours/:id', (req, res) => {

    const id = req.params.id * 1;
    if(id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }

    const tour = tours.find(el => el.id === id);

    res.status(200).json({
        status: 'Success',
        data: {
            tour: tour
        }
    })
});

app.post('/api/v1/tours', (req,res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({id: newId}, req.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'Success',
            data: {
                tour: newTour
            }
        })
    });
});

app.patch('/api/v1/tours/:id', (req,res) => {

    const id = req.params.id * 1;
    if(id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    };

    res.status(200).json({
        status: 'Success',
        data: {
            tour: '<Update tour here....>'
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log('App running....');
});
