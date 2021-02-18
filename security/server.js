require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const Database = require('./database.js')
const randomKey = require('random-key');
const fs = require('fs');
const helmet = require('helmet');
const session = require('express-session');
 
const app = express();
app.listen(8000, () => console.log('por 8000'));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));
app.use(helmet());
app.use(session({
    secret: 'charlei',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 2,
        samesite: true,
        secure: false 
    } 
}));

app.post('/register', (request, response) =>{
    const data = request.body;
    console.log('Got register request');

    const profiles = new Database('profiles');    
    bcrypt.hash(data.password, 10, (err, hash) =>{
        try{
            profiles.new(data.username, {
                password: hash,
                authenticated: false,
                ipAddress: '',
            });
            profiles.save();
            response.json({status: 'success', description: 'User registered'});
        }catch(err){
            console.log(err);
            response.json({status: 'failure', description: err});
        }
    });
});

app.post('/login',async (request, response) =>{
    const data = request.body;
    console.log('Got login request');
    
    let status = {status: 'failure'};
    const profiles = new Database('profiles');
    const profile = profiles.find(data.username)
    if(profile){
        const match = await bcrypt.compare(data.password, profile.password);
        if(match){
            const sessionKey = randomKey.generate(10);
            const timestamp = Date.now();
            profiles.write(data.username, 'authenticated', true);
            profiles.write(data.username, 'ipAddress', data.ipAdress);
            profiles.save();
            status = {status: 'success', description: 'User logged inn'};
        }else{
            status['description'] = 'Passwords dont match'
        }
    }else{
        status['description'] = 'Profile not found'
    }
    
    response.json(status);        
});




