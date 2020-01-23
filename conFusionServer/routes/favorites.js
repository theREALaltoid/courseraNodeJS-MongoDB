const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorites = require("../models/favoriteSchema");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")

  .post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ postedBy: req.user._id }, (err, user) => {
      if (err) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json("User Not Found");
      } else if (user) {
        let onesToBeAdded = [];
        //We need to Filter out Repeated dishes
        for (let i = 0; req.body.length > i; i++) {
          if (!user.dishes.find(({ _id }) => _id === req.body[i]._id)) {
            onesToBeAdded.push(req.body[i]);
            console.log("Added");
          } else {
            //Do Nothing
            console.log("Not Added");
          }
        }
        Favorites.findOneAndUpdate(
          { postedBy: req.user._id },
          { $push: { dishes: onesToBeAdded } }
        )
          .then(
            dish => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(
                "User Has A List Already Adding to Already Created List" + dish
              );
            },
            err => next(err)
          )
          .catch(err => next(err));
      } else {
        Favorites.create({
          dishes: req.body,
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
      }
    });
  })

  .delete(
    authenticate.verifyUser,
    authenticate.verifyListOwner,
    (req, res, err) => {
      Favorites.findOneAndDelete({ postedBy: req.user._id })
        .then(
          deleted => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(deleted);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

favoriteRouter
  .route("/:dishId")
  // // TODO: You need to check for uniqueness of the input before putting it in
  .post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndUpdate(
      { postedBy: req.user._id },
      { $push: { dishes: { _id: req.params.dishId } } }
    )
      .then(
        dish => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(
            "User Has A List Already Adding to Already Created List" + dish
          );
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndUpdate(
      { postedBy: req.user._id },
      { $pull: { dishes: { _id: req.params.dishId } } }
    )
      .then(
        deleted => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(deleted);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });
module.exports = favoriteRouter;
