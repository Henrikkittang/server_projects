const express = require('express');
const Database = require('./dbManager.js');

const port = 8000;
const app = express();
const server = app.listen(port, () => console.log(`listening at port ${port}`));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

app.post('/submit', (request, response) =>{
    console.log('Recived submit request');

    const dates_db = new Database('dates');
    const products_db = new Database('products');


    const key = Object.keys(request.body)[0];
    const data = request.body[key];
    console.log(key, data);

    for(let entry of data)
    {
        if(entry.cost === 0){
            entry.name += ' Free'
        }
        const tp = Date.now();
        if(!products_db.exists(entry.name)){
            products_db.write(entry.name, {cost: entry.cost, percent: entry.percent, timestamp: tp});
        }if(!dates_db.exists(key)){
            dates_db.new(key, []);
        }
        dates_db.pushArray(key, {name: entry.name, amount: entry.amount, timestamp: tp});
        
    }

    dates_db.save();
    products_db.save();

    response.json({stauts:'success', comment:'All is gucci'});
});


app.get('/stats', (request, response) =>{
    console.log('Recived stats request');

    const dates_db = new Database('dates');
    const products_db = new Database('products');

    const stats = {
        total_cost: 0,
        total_100p: 0,
        total_beers: 0
    }

    for(const date in dates_db.getMain()){
        for(const product_name of dates_db.find(date)){
            const product = products_db.find(product_name.name);
            stats.total_cost += product.cost * product_name.amount;
            stats.total_100p +=  (product.percent/100) * product_name.amount;
        }
    }
    stats.total_beers = stats.total_100p * (100 / 4.7) * 2;

    response.json({status: 'success', comment: 'Successfully retrived stats', payload: stats});
}); 






