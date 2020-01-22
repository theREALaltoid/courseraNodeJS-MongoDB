const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
let Schema = mongoose.Schema;
let User = new Schema({
  firstname: {
    type: String,
    default: ""
  },
  lastname: {
    type: String,
    default: ""
  },
  admin: {
    type: Boolean,
    default: false
  }
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);
