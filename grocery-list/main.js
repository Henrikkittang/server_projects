const express = require('express');
const fs = require('fs');
const randomkey = require('random-key');
const Database = require('./database.js');

const app = express();
const server = app.listen(8000, () => {console.log(`listening at port 8000`)});
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

app.post('/addGrocery', (request, response) =>{
    const data = request.body;
        
    const groceries = new Database('groceries');
    const key = randomkey.generate(10);
    groceries.new(key, data);
    
    groceries.save();
    response.json({});
});

app.get('/getGroceries', (request, response) =>{
    const groceries = new Database('groceries');
    
    response.json(groceries.all());
});

app.get('/removeGrocery/:key', (request, response) =>{
    const key = request.params['key'];
    
    const groceries = new Database('groceries');
    groceries.delete(key);
    groceries.save();
    

    response.json({});
});

