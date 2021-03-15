                      require('dotenv').config();
const express       = require('express');
const http          = require('http')
const socketio      = require('socket.io');
const bcrypt        = require('bcrypt');
const crypto        = require('crypto');
const session       = require("express-session");
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Datastore     = require('./nedb_wrapper');
const Logger        = require('./logger');

const myLogger = new Logger({printDebug:true, fileWrite: false, printMode: false});

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const sessionMiddleware = session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false });
 
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json({limit: '2mb'}));

passport.use(
    new LocalStrategy({usernameField : 'email'}, async (email, password, done) => {

        const profileDoc = await profiles.findOne({email: email});

        if(profileDoc){
            const result = await bcrypt.compare( password, profileDoc.password );
            const user = {username: profileDoc.username, id: profileDoc._id};
            return done(null, result ? user : false);             
        }else{
            return done(null, false);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id)
});
passport.deserializeUser(async (id, done) => {
    const profile = await profiles.findOne({_id: id});
    done(null, {username: profile.username, id: profile._id});    
});
  

const ALGORITHM = 'aes-256-cbc'
const BLOCK_SIZE = 16

const databaseConfig = {
    autoload: true,
    afterSerialization (plaintext) {
        // Encryption

        const iv = crypto.randomBytes(BLOCK_SIZE);
        const cipher = crypto.createCipheriv(ALGORITHM, process.env.DATABASE_SECRET, iv);
        const ciphertext = Buffer.concat([iv, cipher.update(plaintext), cipher.final()]);
        return ciphertext.toString('base64');
    },

    beforeDeserialization (ciphertext) {
        // Decryption

        const ciphertextBytes = Buffer.from(ciphertext, 'base64');
        const iv = ciphertextBytes.slice(0, BLOCK_SIZE);
        const data = ciphertextBytes.slice(BLOCK_SIZE);
        const decipher = crypto.createDecipheriv(ALGORITHM, process.env.DATABASE_SECRET, iv);
        const plaintextBytes = Buffer.concat([decipher.update(data), decipher.final()]);
        return plaintextBytes.toString('utf8');
    },
};

const profiles = new Datastore({filename: 'database/profiles.db', autoload: true});
const messages = new Datastore({filename: 'database/messages.db', autoload: true});
const rooms = new Datastore({filename: 'database/rooms.db', autoload: true});


/*
User should only be able to edit his own profile

room
    - name
    - messages
    - users 
*/

require('./routes')(app, profiles);


async function emitRoomMessages(roomId){
    const roomDoc = await rooms.findOne({_id: roomId});

    const messageQuery = roomDoc.messages.map(_roomId => {return {_id: _roomId}});
    const messageDoc = await  messages.find({$or: messageQuery});

    const profileQuery = roomDoc.users.map(_profileId => {return {_id: _profileId}});
    const roomMembers = await profiles.find({$or: profileQuery})    
    roomMembers.forEach(member => {delete member.password});

    io.to(roomId).emit('reciveMessages', {
        roomId: roomId,  
        roomMembers: roomMembers,
        messages: messageDoc
    });
}

async function emitRoomUpdate(profileId, socketId){
    const roomsDoc = await rooms.find({users: { $in: [profileId]}});
    io.to(socketId).emit('roomsUpdate', roomsDoc);
}

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
    socket.request.user ? next() : next(new Error('unauthorized'));
});

io.on('connection', socket =>{
    //Whenever someone connects, this gets executed

    const session = socket.request.session;
    session.socketId = socket.id;
    session.save();
    myLogger.debug(`'${socket.request.user.username}' connected with socket id ${socket.id} in session ${session.id}`);
    myLogger.info(`'${socket.request.user.username}' connected with socket id ${socket.id} in session ${session.id}`);

    (async () => {
        const roomsDoc = await rooms.find({users: { $in: [socket.request.user.id]}});
        roomsDoc.forEach(roomDoc => socket.join(roomDoc._id) );
        emitRoomUpdate(socket.request.user.id, socket.id);
    })();
    
    socket.on('disconnect', () => {
        myLogger.info(`'${socket.request.user.username}' disconnected from socket with id ${socket.id} in session ${session.id}`);
        myLogger.debug(`'${socket.request.user.username}' disconnected from socket with id ${socket.id} in session ${session.id}`);
    });

    socket.on('newRoom', async data => {
        // NB: sanetize data
        myLogger.debug(`New room '${data.roomName}' created by '${socket.request.user.username}'`);

        const profileId = socket.request.user.id;
        const newRoom = {
            name: data.roomName,
            messages: [],
            users: [profileId]
        };

        const roomDoc = await rooms.insert(newRoom);
        socket.join(roomDoc._id);
 
        emitRoomUpdate(profileId, socket.id);

    });

    socket.on('addUserToRoom', async data => {
        // NB: sanetize data
        // NB: Check if socket/user has access to requested room

        myLogger.debug('Trying to add user to room');

        const profileDoc = await profiles.findOne({email: data.email});
        if(profileDoc){
            await rooms.update({ _id: data.roomId}, { $push: {users: profileDoc._id}});
            emitRoomUpdate(profileDoc._id, socket.id);
        }

    });

    socket.on('getRoomMessages', data => {
        // NB: sanetize data
        // NB: Check if socket/user has access to requested room
        emitRoomMessages(data.roomId);
    });

    socket.on('message', async data =>{
        // NB: sanetize data
        // NB: Check if socket/user has access to requested room
        myLogger.debug(`'${socket.request.user.username}' sent message to room ${data.roomId}`)

        const username = socket.request.user.username;
        const profileId = socket.request.user.id;
        const newMessage = {
            username: username,
            profileId: profileId,
            message: data.message,
            timestamp: Date.now()
        }

        const messageDoc = await messages.insert(newMessage);
        const roomDoc = await rooms.findOne({_id: data.roomId});
        if(!roomDoc)
            myLogger.error('Room id not regonized on message event');
        else
            rooms.update({ _id: roomDoc._id}, { $push: {messages: messageDoc._id}});    
        emitRoomMessages(data.roomId);
    });
});

server.listen(process.env.PORT, () => {
    myLogger.info(`Server stared at port ${process.env.PORT}`);
    console.log('listening on port ' + process.env.PORT);
});











