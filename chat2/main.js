                      require('dotenv').config();
const express       = require('express');
const http          = require('http')
const socketio      = require('socket.io');
const Datastore     = require('nedb');
const bcrypt        = require('bcrypt');
const crypto        = require('crypto');
const session       = require("express-session");
const bodyParser    = require("body-parser");
const passport      = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Logger        = require('./logger');

const myLogger = new Logger({fileWrite:false, printMode:true, printDebug:true});
myLogger.info('Server stared');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const sessionMiddleware = session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false });
 
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
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


require('./routes')(app, profiles);


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


    messages.find({}, (err, docs) =>{
        if(err) myLogger.error(err)
        socket.emit('recive', docs);
    });

    socket.on('disconnect', () => {
        console.log(`Disconnected from socket ${socket.id}.`);
    });

    socket.on('message', data =>{
        // NB: sanetize data

        const username = socket.request.user.username;
        const newMessage = {
            username: username,
            message: data.message,
            timestamp: Date.now()
        }
 
        messages.insert(newMessage, (err, messageDoc) => {
            if(err) myLogger.error(err)
            const docId = socket.request.user.id;
            profiles.findOne({_id: docId}, (err, profileDoc) =>{
                if(!profileDoc)
                    myLogger.error('User id not regonized on message event');
                else
                    profiles.update({ _id: profileDoc._id}, { $push: {messages: messageDoc._id}});    
            });
        });

        messages.find({}, (err, docs) =>{
            if(err) myLogger.error(err)
            io.emit('recive', docs);
        });
    });
});

server.listen(3000, () => {
   console.log('listening on port 3000');
});











