let createError = require("http-errors");
let express = require("express");
let path = require("path");

let passport = require("passport");
let authenticate = require("./authenticate");
let config = require("./config.js");
let logger = require("morgan");
let session = require("express-session");
let FileStore = require("session-file-store")(session);

let indexRouter = require("./routes/index");
let dishRouter = require("./routes/dishRouter");
let promoRouter = require("./routes/promoRouter");
let leaderRouter = require("./routes/leaderRouter");
let userRouter = require("./routes/users");
let uploadRouter = require("./routes/uploadRouter");
let favoriteRouter = require("./routes/favoriteRouter");
let cookieParser = require("cookie-parser");
let app = express();
app.all("*", (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    res.redirect(
      307,
      "https://" + req.hostname + ":" + app.get("secPort") + req.url
    );
  }
});
const mongoose = require("mongoose");

const Dishes = require("./models/dishes");

const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then(
  db => {
    console.log("Connected correctly to server");
  },
  err => {
    console.log(err);
  }
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser("12345-67890-09876-54321"));

app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/users", userRouter);

app.use(express.static(path.join(__dirname, "public")));
app.use("/favoriteRouter", favoriteRouter);
app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);
app.use("/imageUpload", uploadRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
