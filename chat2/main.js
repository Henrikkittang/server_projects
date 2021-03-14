                      require('dotenv').config();
const express       = require('express');
const http          = require('http')
const socketio      = require('socket.io');
const Datastore     = require('nedb');
const bcrypt        = require('bcrypt');
const crypto        = require('crypto');
const session       = require("express-session");
const passport      = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Logger        = require('./logger');

const myLogger = new Logger({printDebug:true, fileWrite: false, printMode: false});
myLogger.info('Server stared');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const sessionMiddleware = session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false });
 
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json({limit: '2mb'}));

passport.use(
    new LocalStrategy({usernameField : 'email'}, (email, password, done) => {
        profiles.findOne({email: email}, async (err, profileDoc) =>{
            if(profileDoc){
                const result = await bcrypt.compare( password, profileDoc.password );
                const user = {username: profileDoc.username, id: profileDoc._id};
                return done(null, result ? user : false);             
            }else{
                return done(null, false);
            }
        });
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id)
});
passport.deserializeUser((id, done) => {
    profiles.findOne({_id: id}, (err, profile) => {
        done(null, {username: profile.username, id: profile._id});    
    }); 
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

function emitRoomMessages(roomId){
    rooms.findOne({_id: roomId}, (err, roomDoc) =>{
        if(err) myLogger.error(err);

        const query = roomDoc.messages.map(_roomId => {return {_id: _roomId}});

        messages.find({$or: query}, (err, messageDoc) =>{
            if(err) myLogger.error(err);
            io.to(roomId).emit('reciveMessages', messageDoc);
        });
    });
}

function emitRoomUpdate(profileId, socketId){
    rooms.find({users: { $in: [profileId]}}, (err, roomsDoc)=>{
        if(err) myLogger.error(err);
        io.to(socketId).emit('roomsUpdate', roomsDoc);
    });
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

    emitRoomUpdate(socket.request.user.id, socket.id);
    
    socket.on('disconnect', () => {
        myLogger.info(`'${socket.request.user.username}' disconnected from socket with id ${socket.id} in session ${session.id}`);
        myLogger.debug(`'${socket.request.user.username}' disconnected from socket with id ${socket.id} in session ${session.id}`);
    });

    socket.on('newRoom', data => {
        // NB: sanetize data
        myLogger.debug(`New room '${data.roomName}' created by '${socket.request.user.username}'`);

        const profileId = socket.request.user.id;
        const newRoom = {
            name: data.roomName,
            messages: [],
            users: [profileId]
        };
 
        rooms.insert(newRoom, (err, roomDoc) => {
            if(err) myLogger.error(err);
            socket.join(roomDoc._id);
        });

        emitRoomUpdate(profileId, socket.id);

    });

    socket.on('addUserToRoom', data => {
        // NB: sanetize data
        // NB: Check if socket/user has access to requested room

        myLogger.debug('Trying to add user to room');

        profiles.findOne({email: data.email}, (err, profileDoc) =>{
            if(err) myLogger.error(err);
            if(profileDoc){
                rooms.update({ _id: data.roomId}, { $push: {users: profileDoc._id}});
                emitRoomUpdate(profileDoc._id, socket.id);
            }
        });
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
 
        messages.insert(newMessage, (err, messageDoc) => {
            if(err) myLogger.error(err);
            rooms.findOne({_id: data.roomId}, (err, roomDoc) =>{
                if(err) myLogger.error(err);
                if(!roomDoc)
                    myLogger.error('Room id not regonized on message event');
                else
                    rooms.update({ _id: roomDoc._id}, { $push: {messages: messageDoc._id}});    
                emitRoomMessages(data.roomId);
            });
        });

    });
});

server.listen(3000, () => {
   console.log('listening on port 3000');
});











