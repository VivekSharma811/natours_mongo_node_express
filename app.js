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

    const tour = tours.find();

    res.status(200).json({
        status: 'Success',
        
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

const port = 3000;
app.listen(port, () => {
    console.log('App running....');
});
