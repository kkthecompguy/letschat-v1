const ChatForm = document.getElementById('chat-form')
const ChatMessages  =document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//Get user and room
const { username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});


const socket = io();

// Join chat room
socket.emit('joinRoom', {username, room});

// Get room and users
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputRoomUsers(users);
})

// Message form server
socket.on('message', message => {
  outputMessage(message);

  // Scroll down
  ChatMessages.scrollTop = ChatMessages.scrollHeight;
});

// ChatForm event handler
ChatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get msg from text
  msg = e.target.elements.msg.value;

  // Emit msg to server
  socket.emit('chatMessage', msg);

  e.target.elements.msg.value = '';
  e.target.elements.msg.focus()
})

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `
  <p class="meta">${message.username}<span> ${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>
  `
  document.querySelector('.chat-messages').appendChild(div);
}

// Output room name
function outputRoomName(room) {
  roomName.innerText = room
}

// Output room users
function outputRoomUsers(users) {
  userList.innerHTML =  `
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}