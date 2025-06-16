const express = require("express");
const http = require("http");
const { setupVideoServer } = require("./video");

const app = express();
const server = http.createServer(app);

setupVideoServer(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(Video server running on port ${PORT});
});
