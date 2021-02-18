const express = require('express');
const fetch = require('node-fetch');
const breweryDB = require('./breweryDB.js');
require('dotenv').config()

const Beer = new breweryDB.Beer(process.env.BREWERY_DB_KEY);
const Brewery = new breweryDB.Brewery(process.env.BREWERY_DB_KEY)

const app = express();  
app.listen(process.env.PORT, () => {console.log(`listening at port ${process.env.PORT}`)});
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));


app.get('/beer_search_name/:name', async (request, response) =>{
    console.log('got name request');
    const name = request.params['name'];
    
    const beer_json = await Beer.find(name, {withBreweries: 'Y'});       
    response.json(beer_json);        
});


app.get('/get_by_id/:id', async (request, response) =>{
    console.log('got id request');
    const id = request.params['id'];
    
    const beer_json = await Beer.getById(id, {withBreweries: 'Y'});
    response.json(beer_json);
});

app.get('/location/:loc_name', async (request, response) =>{
    console.log('Got location request');
    const loc_name = request.params['loc_name'];
    const latlon = await fetch(`https://api.opencagedata.com/geocode/v1/geojson?q=${loc_name}&key=${process.env.OPENCAGEDATA_KEY}`)
    json = await latlon.json();
    response.json(json);
});

app.get('/breweries/:latlon&:radius', async (request, response) =>{
    console.log('Got brewery request');
    const latlon = request.params['latlon'].split(',');
    const radius = parseInt(request.params['radius']);
    const breweries = await Brewery.getByCoors(latlon, {
        unit: 'km',
        radius: radius
    });
    response.json(breweries);
});

/**/