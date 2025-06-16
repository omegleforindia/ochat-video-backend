const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let waitingSocket = null;

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('join-video', () => {
    if (waitingSocket) {
      const partner = waitingSocket;
      waitingSocket = null;

      socket.emit('ready');
      partner.emit('ready');

      socket.partner = partner;
      partner.partner = socket;
    } else {
      waitingSocket = socket;
    }
  });

  socket.on('offer', offer => {
    if (socket.partner) socket.partner.emit('offer', offer);
  });

  socket.on('answer', answer => {
    if (socket.partner) socket.partner.emit('answer', answer);
  });

  socket.on('candidate', candidate => {
    if (socket.partner) socket.partner.emit('candidate', candidate);
  });

  socket.on('disconnect', () => {
    if (waitingSocket === socket) {
      waitingSocket = null;
    }
    if (socket.partner) {
      socket.partner.emit('leave');
      socket.partner.partner = null;
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(🎥 Video server running on port ${PORT}));
