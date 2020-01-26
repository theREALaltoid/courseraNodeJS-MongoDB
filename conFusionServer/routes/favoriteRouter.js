const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorites = require("../models/favoriteSchema");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

//Just Queries the dataBase for user account

const queryDB = function(req, res) {
  Favorites.findOne({ postedBy: req.user._id })
    .populate("postedBy")
    .populate("dishes")
    .then(query => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(query);
    });
};

// Sanatizes input to prevent duplicates
const filter = function(req, res, user, onesToTest) {
  let onesToBeAdded = [];

  if (user) {
    for (let i = 0; onesToTest.length > i; i++) {
      if (user.dishes.indexOf(onesToTest[i]) === -1) {
        onesToBeAdded.push(onesToTest[i]);
        console.log(req.body[i]._id);
      } else {
        //Do Nothing
        console.log("Not Added");
      }
    }
    console.log(onesToBeAdded);
    return onesToBeAdded;
  } else {
    for (let i = 0; onesToTest.length > i; i++) {
      onesToBeAdded.push(onesToTest[i]);
      ///  console.log(req.body[i]);
    }
    console.log(onesToTest);
    return onesToBeAdded;
  }
};

//Function Creates List if one isn't found
const createList = function(req, res, onesToBeAdded) {
  Favorites.create({
    dishes: onesToBeAdded,
    postedBy: req.user._id
  })
    .then(
      favorite => {
        console.log(favorite);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      },
      err => next(err)
    )
    .catch(err => next(err));
};

///Updates Already created lists
const update = function(req, res, onesToBeAdded) {
  Favorites.findOneAndUpdate(
    { postedBy: req.user._id },
    { $push: { dishes: onesToBeAdded } }
  )
    .then(
      dish => {
        queryDB(req, res);
      },
      err => res.json("onesToBeAdded")
    )
    .catch(err => res.json(onesToBeAdded));
};

//All in one function that fetches user account and calls needed functions to
//Update or Create new account

const fetch = function(req, res, onesToTest) {
  Favorites.findOne({ postedBy: req.user._id }, (err, user) => {
    if (err) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json("User Not Found");
    } else if (user) {
      ///  filter(req, res, user);
      onesToBeAdded = filter(req, res, user, onesToTest);
      console.log(onesToBeAdded.length);
      if (onesToBeAdded.length >= 1) {
        update(req, res, onesToBeAdded);
      } else {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json("None Added");
      }
    } else {
      onesToBeAdded = filter(req, res, user, onesToTest);
      if (onesToBeAdded.length >= 1) {
        createList(req, res, onesToBeAdded);
      } else {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json("None Added");
      }
    }
  });
};

favoriteRouter
  .route("/")

  .get(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyListOwner,
    (req, res, next) => {
      queryDB(req, res);
    }
  )

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //We need to Filter out Repeated dishes
    let onesToTest = [...new Set(req.body.map(data => data._id))];
    fetch(req, res, onesToTest);
  })

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyListOwner,
    (req, res, err) => {
      Favorites.findOneAndDelete({ postedBy: req.user._id })
        .then(
          deleted => {
            queryDB(req, res);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

favoriteRouter
  .route("/:dishId")
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    let onesToTest = [req.params.dishId];
    fetch(req, res, onesToTest);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndUpdate(
      { postedBy: req.user._id },
      { $pull: { dishes: req.params.dishId } }
    )
      .then(
        deleted => {
          queryDB(req, res);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });
module.exports = favoriteRouter;
