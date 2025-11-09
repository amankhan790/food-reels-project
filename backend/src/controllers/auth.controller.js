const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const foodPartnerModel = require("../models/foodPartner.model");

async function registerUser(req, res) {
  const { fullName, email, password } = req.body;

  const isUserAlreadyExist = await userModel.findOne({
    email,
  });

  if (isUserAlreadyExist) {
    return res.status(400).json({
      messege: "User already exist",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    fullName,
    email,
    password: hashPassword,
  });

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET
  );

  res.cookie("token", token);

  res.status(201).json({
    messege: "user registered successfully",
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email,
  });

  if (!user) {
    return res.status(400).json({
      messege: "Invalid email or password",
    });
  }

  const isPassword = await bcrypt.compare(password, user.password);

  if (!isPassword) {
    return res.status(400).json({
      messege: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    {
      _id: user._id,
    },
    process.env.JWT_SECRET
  );

  res.cookie("token", token);

  res.status(200).json({
    messege: "User logged in succesfully",
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
}

function logoutUser(req, res) {
  res.clearCookie("token");
  res.status(200).json({
    messege: "User logged out successfully",
  });
}

async function registerFoodPartner(req, res) {
  const { name, email, password } = req.body;

  const isPartnerAlreadyExist = await foodPartnerModel.findOne({
    email,
  });

  if (isPartnerAlreadyExist) {
    return res.status(400).json({
      messege: "Food Partner already exist",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const foodPartner = await foodPartnerModel.create({
    name,
    email,
    password: hashPassword,
  });

  const token = jwt.sign(
    {
      id: foodPartner._id,
    },
    process.env.JWT_SECRET
  );

  res.cookie("token", token);

  res.status(201).json({
    messege: "Food Partner registered successfully",
    foodPartner: {
      _id: foodPartner._id,
      email: foodPartner.email,
      name: foodPartner.name,
    },
  });
}

async function loginFoodPartner(req, res) {
  const { email, password } = req.body;
  const foodPartner = await foodPartnerModel.findOne({
    email,
  });

  if (!foodPartner) {
    return res.status(400).json({
      messege: "Invalid email or password",
    });
  }

  const isPassword = await bcrypt.compare(password, foodPartner.password);

  if (!isPassword) {
    return res.status(400).json({
      messege: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    {
      id: foodPartner._id,
    },
    process.env.JWT_SECRET
  );

  res.cookie("token", token);

  res.status(200).json({
    messege: "Food Partner logged in successfully",
    foodPartner: {
      _id: foodPartner._id,
      email: foodPartner.email,
      name: foodPartner.name,
    },
  });
}

function logoutFoodPartner(req, res) {
  res.clearCookie("token");
  res.status(200).json({
    messege: "User logged out successfully",
  });
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  registerFoodPartner,
  loginFoodPartner,
  logoutFoodPartner,
};
