const express = require("express"),
  http = require("http");
const morgan = require("morgan");

const hostname = "localhost";
const port = 3000;
const dishRouter = require("./routes/dishRouter");

const app = express();
const bodyParser = require("body-parser");

app.use(morgan("dev"));

app.use(express.static(__dirname + "/public"));

const server = http.createServer(app);

server.listen(port, hostname, () => {
  app.use(bodyParser.json());

  app.use("/dishes", dishRouter);
});
