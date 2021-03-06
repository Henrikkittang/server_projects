const bcrypt   = require('bcrypt');
const passport = require('passport');

module.exports = (app, profiles) => {


    function checkAuthenticated(request, response, next) {
        request.isAuthenticated() ? next() : response.redirect('/login');
    }
    
    function checkNotAuthenticated(request, response, next) {
        (!request.isAuthenticated()) ? next() : response.redirect('/');
    }

    app.get('/', checkAuthenticated, (request, response) => { 
        console.log('got request for index.html');
        response.sendFile('/public/index.html', {root: __dirname + '/..'});
    }); 
    
    app.post('/register', checkNotAuthenticated, (request, response) => {
        // NB: sanetize data

        const {email, username, password, password_confirm} = request.body;
        if(password != password_confirm)
            response.json({status: 'failure', details:'passwords dont match'});
    
        profiles.findOne({email: email}, async (err, profile) => {
            if(profile){
                response.json({status: 'failure', details:'email already registered'})
            }else{
                const hashedPassword = await bcrypt.hash(password, 10);
                profiles.insert({email: email, username: username, password: hashedPassword});
                
                response.json({status: 'success', details:'user registered'});
            }
        });
    });

    app.get('/login', checkNotAuthenticated, (request, response) => {
        response.sendFile('/public/login.html', {root: __dirname + '/..'});
    })

    app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
    }));


    app.post('/logout', (request, response) => {
        console.log(`logout ${request.session.id}`);
        const socketId = request.session.socketId;
        if (socketId && io.of('/').connected[socketId]) {
        console.log(`forcefully closing socket ${socketId}`);
        io.sockets.connected[socketId].disconnect(true);
        }
        request.logout();
        response.cookie('connect.sid', '', { expires: new Date() });
        response.redirect('/');
    });

}