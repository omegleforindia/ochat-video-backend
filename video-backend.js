const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let waitingUser = null;

io.on('connection', (socket) => {
  console.log(User connected: ${socket.id});

  if (waitingUser) {
    socket.partner = waitingUser;
    waitingUser.partner = socket;

    waitingUser.emit('match', socket.id);
    socket.emit('match', waitingUser.id);

    waitingUser = null;
  } else {
    waitingUser = socket;
  }

  socket.on('offer', (data) => {
    if (socket.partner) {
      socket.partner.emit('offer', data);
    }
  });

  socket.on('answer', (data) => {
    if (socket.partner) {
      socket.partner.emit('answer', data);
    }
  });

  socket.on('ice-candidate', (data) => {
    if (socket.partner) {
      socket.partner.emit('ice-candidate', data);
    }
  });

  socket.on('disconnect', () => {
    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit('leave');
    }

    if (waitingUser === socket) {
      waitingUser = null;
    }

    console.log(User disconnected: ${socket.id});
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});
