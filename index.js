const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave , getRoomUsers} = require('./utils/users');

const app = express();
// needed for socket.io
const server = http.createServer(app);
const io = socketio(server);
// Set static folders
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'public/js')));

const botName = 'BOT';
Aliens = [];
Bombs = [];

io.on('connection', socket => {
    socket.on('joinRoom', ({username,room}) => {
        console.log("User: " + username);
        if(getRoomUsers(room).length >= 2) {
            socket.emit('roomFull',formatMessage(botName,'this room is full! Leave room and try another id...'));
        }
        else {
            if(getRoomUsers(room).length == 1) {
                socket.emit('message', formatMessage(botName,'WELCOME!'));
            }
            else {
                console.log(getRoomUsers(room).length)
                socket.emit('message', formatMessage(botName,'WELCOME! Waiting for another player to join...'));
            }
            //push new user and return the user
            //user = { id, username, room }
            const user = userJoin(socket.id, username, room);
            
            socket.join(user.room);
        
            // broadcast an entry except to client connecting
            socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined`));
            
            // send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
    // start game
    socket.on('start', (message) => {
        const user = getCurrentUser(socket.id);
        
        if(user != undefined && getRoomUsers(user.room).length > 1){
            console.log("NOOOOOOOOOOOOOOOOOO")
            socket.emit('playerTwo')
        }
    });
    socket.on('paddle', (data) => {
        const user = getCurrentUser(socket.id);
        // Aliens = data.Aliens;
        // Bombs = data.Bombs;
        //sending to all clients in 'game' room(channel) except sender
        if(user != undefined)
            socket.broadcast.to(user.room).emit('XXX',data);
    });
    
    socket.on('update', (data) => {
        const user = getCurrentUser(socket.id);
        // Aliens = data.Aliens;
        // Bombs = data.Bombs;
        //sending to all clients in 'game' room(channel) except sender
        if(user != undefined)
            socket.broadcast.to(user.room).emit('updated',data);
    });

    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);
        if(user != undefined)
            io.to(user.room).emit('message',formatMessage(user.username,message));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user != undefined){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left :/`));
            io.to(user.room).emit('dc');
            console.log("User disconnected: " + user.username);
            // send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});


const PORT = process.env.PORT || 5000;

//app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))