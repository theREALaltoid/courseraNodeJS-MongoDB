let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
let User = require("./models/user");

let JwtStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt;
let jwt = require("jsonwebtoken");
let config = require("./config.js");
const Dishes = require("./models/dishes");
const Favorites = require("./models/favoriteSchema");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
  return jwt.sign(user, config.secretKey, { expiresIn: 36000 });
};

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(
    opts,

    (jwt_payload, done) => {
      console.log("JWT payload ", jwt_payload);
      User.findOne({ _id: jwt_payload._id }, (err, user) => {
        if (err) {
          return done(err, false);
        } else if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    }
  )
);
exports.verifyUser = passport.authenticate("jwt", { session: false });
exports.verifyAdmin = (req, err, next) => {
  console.log(req.user.admin);
  if (req.user.admin == false) {
    err = new Error("You are not an admin. Access Denied");
    err.status = 403;
    return next(err);
  } else {
    next();
  }
};
exports.verifyPoster = (req, err, next) => {
  let id1 = req.user._id;

  Dishes.findById(req.params.dishId)
    .populate("comments.author")
    .then(dish => {
      if (id1.equals(dish.comments.id(req.params.commentId).author._id)) {
        next();
      } else {
        err = new Error("You are not an the author. Access Denied");
        err.status = 403;
        return next(err);
      }
    });
};

exports.verifyListOwner = (req, err, next) => {
  let id = req.user._id;

  Favorites.findOne({ postedBy: req.user._id }, (err, user) => {
    if (user) {
      next();
    } else {
      err = new Error("You are not an the author. Access Denied");
      err.status = 403;
      return next(err);
    }
  });
};
