const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteSchema = new Schema(
  {
    dishes: { type: Array },

    postedBy: {
      type: String
    }
  },
  {
    timestamps: true
  }
);
let Favorites = mongoose.model("Favorites", favoriteSchema);

module.exports = Favorites;
