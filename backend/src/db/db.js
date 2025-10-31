const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect("mongodb://localhost:27017/food-view")
    .then(() => {
      console.log("Mongodb connected :");
    })
    .catch((err) => {
      console.log("Mongodb connection error", err);
    });
}

module.exports = connectDB;
