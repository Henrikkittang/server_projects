// imports
const express = require('express');
const socket = require('socket.io');
const randomKey = require('random-key');
const authIO = require('socketio-auth');
const fs = require('fs');
const Database = require('./dbManager.js');
const bcrypt = require('bcrypt');

// App setup with express
const app = express();
const server = app.listen(8000, () => {console.log(`listening at port 8000`)});
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));
    
// Socket setup with socket.io
numConections = 0
const io = socket(server);

function authenticate(userInfo) {
    const key = userInfo.username;
    
    const profiles = new Database('profiles');
    const dbUser = profiles.find(key)
    
    if(dbUser){
        if(dbUser.sessionKey === userInfo.sessionKey){
            return true;
        }
    }
    return false;
}

function emitRooms(socket, userKey) { 
    // emits all the room names and id for a specific user to the correct client
    const rooms = new Database('rooms');
    const user = new Database('profiles').find(userKey);
        
    const roomNames = []
    user.rooms.forEach(room => { roomNames.push( rooms.find(room).name ) } );
    socket.emit('newRoom', {roomNames: roomNames, roomIDs: user.rooms});
}

authIO(io, {
    authenticate: (socket, data, callback) => {   
        const key = data.username;
        if(authenticate(data)){
            const profiles = new Database('profiles');
            
            user = profiles.find(key);
            if(user.authenticated === true){
                return callback(new Error('user already logged inn'));
            }
            
            profiles.write(key, 'authenticated', true); 
            profiles.write(key, 'socketID', socket.id);                               
            profiles.save();
            
            users[`${socket.id}`] = data.username;
        
            const messages = new Database('messages');
            return callback(null, messages.mainObject);
        }
        else{
            console.log('user disconnect by server')
            //socket.disconnect(true);
            return callback(new Error('user not found'));
        }       
    },
    postAuthenticate: (socket, data, callback) =>{
        io.sockets.emit('activeUsers', users);
        
        const key = data.username;
        emitRooms(socket, key);
    },
    disconnect: (socket) =>{
        numConections -= 1;
        
        const key = users[`${socket.id}`];
        delete users[`${socket.id}`];
        
        const profiles = new Database('profiles');
        
        try{profiles.write(key, 'authenticated', false)}
        catch(err){}
        
        profiles.save();
        io.sockets.emit('activeUsers', users);        
        console.log(`Socket ${socket.id} disconnected. ${numConections} sockets conencted`);
    }
});
            
users = {}

io.on('connection', socket => {
    // Runs on each new connection. Updates the socket count on all screens
    // and logs the new connection to the server
    numConections += 1;
    console.log(`Made socket connection with ${socket.id}. ${numConections} sockets conencted`);
    
    socket.on('subscribe', room => { 
        socket.join(room);
        const roomMessages = new Database('messages').find(room);
        const roomUsers = new Database('rooms').find(room).users;
        socket.emit('subscribe', {
            roomMessages: roomMessages, 
            roomUsers: roomUsers
        }); 
    });

    socket.on('unsubscribe', room => {  
        socket.leave(room); 
    });
    
    socket.on('typing', data => {
        if(authenticate(data)){
            //socket.broadcast.emit('typing', data.username);
            //io.sockets.in(data.room).broadcast('typing', data.username);    
        }
    });        

    // Revives messages and send it to the right room
    socket.on('chat', data => {
        if(!authenticate(data) || data.message === ''){return}
        
        /*if(!(new Database('profiles').mainObject[`${data.username}`].rooms.includes(data.room))){
            console.log(data.username, 'has not access to room', data.room);
        }*/
        
        delete data.sessionKey;
        data['timestamp'] = Date.now();
        
        const messages = new Database('messages');
        const key = randomKey.generate(10);
        
        messages.mainObject[data.room][`${key}`] = data;
        messages.save();
        
        // Sends the message to the specific room
        io.sockets.in(data.room).emit('message', data);    
    });
    
    // Adds new room
    socket.on('newRoom', data =>{
        if(authenticate(data)){
            const messagesRooms = new Database('messages');
            const rooms = new Database('rooms');
            const profiles = new Database('profiles');
            const roomID = randomKey.generate(10);
            
            const key = data.username;
            rooms.new(roomID, {
                name: data.roomName, 
                users: [key]
            });
            messagesRooms.new(roomID, {});
            profiles.pushArray(key, 'rooms', roomID);
            
            socket.join(roomID);
            
            messagesRooms.save(); 
            rooms.save(); 
            profiles.save();
            
            emitRooms(socket, key);
        }
    });
    
    // Adds user to a room
    socket.on('addToRoom', data =>{
        const profiles = new Database('profiles');
        const userKey = data.newUser;
        if(authenticate(data) && profiles.find(userKey)){
            const roomKey = data.roomID;
            const rooms = new Database('rooms');
            
            profiles.pushArray(userKey, 'rooms', data.roomID);
            rooms.pushArray(roomKey, 'users', userKey);
            profiles.save();
            rooms.save();
            
            const users = rooms.find(roomKey).users;
            users.forEach((user, index) =>{
                const socketID = profiles.find(user).socketID;
                const userSocket = io.sockets.connected[socketID]
                emitRooms(userSocket, user);
            });
        }
    });
    
    // removes user from room
    socket.on('removeUserFromRoom', data =>{
        if(authenticate(data)){
            const userKey = data.userToRemove;
            const roomKey = data.room;
            const profiles = new Database('profiles');
            const rooms = new Database('rooms');

            profiles.removeArray(userKey, 'rooms', roomKey);
            rooms.removeArray(roomKey, 'users', userKey);
            
            profiles.save();
            rooms.save();
            
            const users = rooms.find(roomKey).users;
            users.forEach((user, index) =>{
                const socketID = profiles.find(user).socketID;
                const userSocket = io.sockets.connected[socketID]
                emitRooms(userSocket, user);
            });
            
        }
    });

});


// registers new user
app.post('/register', async (req, res) => {
    const newUser = req.body;   // gets the new user info from the client
    newUser.username = newUser.username.trim();
    newUser.password_1 = newUser.password_1.trim();
    newUser.password_2 = newUser.password_2.trim();
    newUser.username = newUser.username.charAt(0).toUpperCase() + newUser.username.slice(1);
    const key = newUser.username;
    
    const profiles = new Database('profiles');
    const user = profiles.find(key);
    
    // if one of the lines is blank, error
    if((newUser.username || newUser.password_1 || newUser.password_2) == ''){
        res.json({status:'failed', details:'blank not allowed'});
        return;
    }
    
    // if the username is already taken, error
    if(user){
        res.json({status: 'failed', details:'username taken'});
        return;
    }

    // if the password is to short, error
    if(newUser.password_1.length < 8){
        res.json({staus:'failed', details:'password to short'});
        return;
    }
    
    // If the passwords dont match, error
    if(newUser.password_1 !== newUser.password_2){
        res.json({status: 'failed', details:'password didnt match'});
        return;
    }
    
    bcrypt.hash(newUser.password_1, 10, (err, hash) =>{
        const password_hash = hash;
        // adds the new profile to the database and saves it
        const data = {
            password: password_hash,
            authenticated: false,
            sessionKey: null,
            rooms: [],
        }
        profiles.new(`${newUser.username}`, data);
        
        profiles.save();
    });
        
    // returns success message
    res.json({status:'success', details:'user registerd'});
    console.log(`'${newUser.username}' registered`);

});

// login for registered users
app.post('/login', async (req, res) => {
    const data = req.body;    // gets the new user info from the client
    data.username = data.username.trim();
    data.username = data.username.charAt(0).toUpperCase() + data.username.slice(1);
    const key = data.username
    
    const profiles = new Database('profiles');
    const user = profiles.find(key);
        
    // If the user is found, then check the password
    if(user){
        // If the inputed password match, then return success message
        if(bcrypt.compare(data.password, user.password)){
            const sessionKey = randomKey.generate(10);
                
            profiles.write(key, 'sessionKey', sessionKey);
            profiles.write(key, 'authenticated', false);
            
            res.json({status:'success', details:'user authenticated', sessionKey:sessionKey, username:data.username});
            console.log(`'${data.username}' logged inn`);
            
            profiles.save();
            
            return;

        }
        
        // else return error saying password didnt match
        else{
            res.json({status:'failure', details:'username and password dont match'});
            return;
        }            
    }
    // if the loops exits without returning, then the user was not found in the database
    // so return error message
    res.json({status: 'failure', details: 'user was not found'});
});

/**/