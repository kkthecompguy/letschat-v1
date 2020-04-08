const path = require('path')
const http = require('http')
const express = require('express')
const socketIo = require('socket.io')
const formatMessage = require('./utils/message')
const { userJoin, getCurrentUser,  userLeave, getRoomUsers} = require('./utils/users')


const app = express()
const server =  http.createServer(app)
const io = socketIo(server)


chatbot = 'ChatBot'

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Runs when client connects
io.on('connection', socket => {
  //Listen for join room
  socket.on('joinRoom', ({username, room}) => {
    //Join a user to the room
    const user = userJoin(socket.id, username, room)
    socket.join(user.room)

    // Welcome current user
    socket.emit('message', formatMessage(chatbot,'Welcome To LetsChat'))

    //broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit('message', formatMessage(chatbot, `${user.username} has joined the chat`));

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  });

  //Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id)

    io.to(user.room).emit('message', formatMessage(user.username, msg))
  });

  //Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if(user) {
      io.to(user.room).emit('message', formatMessage(chatbot, `${user.username} has left the chat`));

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})