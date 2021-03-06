const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();
    
// Initialises the static file with express
const app = express();
const port = process.env.PORT || 8000;
app.listen(port, () => {console.log(`listening at port ${port}`)});
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));
    
// Initialises NeDB database objcet
let database = new Datastore('database.db');
database.loadDatabase();

// Returns the content of the database
app.get('/api', (request, response) =>{    
    database.find({}, (error, data) =>{
        if(error){
            console.log(error);
            response.end();
            return;
        }
        response.json(data);        
    });
});

// Gets request from client and saves them in the database
app.post('/api', (request, response) =>{
    console.log('I got a request!');
    const data = request.body;
    const timestamp = Date.now();
    data.timestamp = timestamp;
    database.insert(data);
    response.json(data);
});

app.get('/weather/:latlon', async (request, response) =>{
    const latlon = request.params['latlon'].split(',');
    const latitude = latlon[0];
    const longitude = latlon[1];
         
    const darksky_key = process.env.DARKSKY_KEY; 
    const weather_url = `https://api.darksky.net/forecast/${darksky_key}/${latitude},${longitude}/?units=si`
    const weather_response = await fetch(weather_url); 
    const weather_data = await weather_response.json();
    
    const aq_url = `https://api.openaq.org/v1/latest?coordinates=${latitude},${longitude}`
    const aq_response = await fetch(aq_url); 
    const aq_data = await aq_response.json();

    const data = {
        weather: weather_data,
        air_quality: aq_data
    };

    response.json(data);
});
/**/
