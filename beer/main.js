const express = require('express');
const fetch = require('node-fetch');
const breweryDB = require('./breweryDB.js');

const brewdb = new breweryDB('f5a6e9a935f59c61b84739b8d2f150d9&p');

const app = express();  
app.listen(8000, () => {console.log(`listening at port 8000`)});
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));


app.get('/beer_search_name/:name', async (request, response) =>{
    console.log('got name request');
    const name = request.params['name'];
    
    const beer_json = await brewdb.beer.find(name, {withBreweries: 'Y'});       
    response.json(beer_json);        
});


app.get('/get_by_id/:id', async (request, response) =>{
    console.log('got id request');
    const id = request.params['id'];
    
    const beer_json = await brewdb.beer.getById(id, {withBreweries: 'Y'});
    response.json(beer_json);
});

app.get('/location/:loc_name', async (request, response) =>{
    const loc_name = request.params['loc_name'];
    const latlon = await fetch(`https://api.opencagedata.com/geocode/v1/geojson?q=${loc_name}&key=e56086c26fd943e7b7038c739616de1d`)
    json = await latlon.json();
    response.json(json);
});

app.get('/breweries/:latlon&:radius', async (request, response) =>{
    const latlon = request.params['latlon'].split(',');
    const radius = parseInt(request.params['radius']);
    const breweries = await brewdb.brewery.getByCoors(latlon, {
        unit: 'km',
        radius: radius
    });
    response.json(breweries);
});

/**/