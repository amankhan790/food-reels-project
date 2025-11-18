const express = require("express");
const cookieparser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.routes");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "https://food-reels-project-1.onrender.com",
    credentials: true,
  })
);
app.use(cookieparser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world world");
});

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);

module.exports = app;
