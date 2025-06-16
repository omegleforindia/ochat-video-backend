const { Server } = require("socket.io");

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const waitingUsers = [];

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", () => {
      if (waitingUsers.length > 0) {
        const partner = waitingUsers.pop();

        socket.partner = partner;
        partner.partner = socket;

        socket.emit("match", true);  // this user creates offer
        partner.emit("match", false); // this user waits for offer
      } else {
        waitingUsers.push(socket);
      }
    });

    socket.on("offer", (offer) => {
      if (socket.partner) {
        socket.partner.emit("offer", offer);
      }
    });

    socket.on("answer", (answer) => {
      if (socket.partner) {
        socket.partner.emit("answer", answer);
      }
    });

    socket.on("ice-candidate", (candidate) => {
      if (socket.partner) {
        socket.partner.emit("ice-candidate", candidate);
      }
    });

    socket.on("next", () => {
      if (socket.partner) {
        socket.partner.emit("next");
        socket.partner.partner = null;
      }
      socket.partner = null;
      waitingUsers.push(socket);
    });

    socket.on("disconnect", () => {
      if (socket.partner) {
        socket.partner.emit("next");
        socket.partner.partner = null;
      }

      const index = waitingUsers.indexOf(socket);
      if (index !== -1) {
        waitingUsers.splice(index, 1);
      }
    });
  });
};
