const foodModel = require("../models/food.model");
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.models");
const serviceStorage = require("../services/storage.service");
const { v4: uuid } = require("uuid");

async function createFood(req, res) {
  const fileUploadResult = await serviceStorage.uploadFile(
    req.file.buffer,
    uuid()
  );

  const foodItem = await foodModel.create({
    name: req.body.name,
    description: req.body.description,
    video: fileUploadResult.url,
    foodPartner: req.foodPartner._id,
  });

  res.status(201).json({
    message: "Food item created successfully",
    foodItem,
  });
}

async function getAllFood(req, res) {
  const foodItems = await foodModel.find({});
  res.status(200).json({
    message: "Food items fetched successfully",
    foodItems,
  });
}

async function likeFood(req, res) {
  const { foodId } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const isAlreadyLiked = await likeModel.findOne({
    user: user._id,
    food: foodId,
  });

  if (isAlreadyLiked) {
    await likeModel.deleteOne({
      user: user._id,
      food: foodId,
    });

    await foodModel.findByIdAndUpdate(foodId, {
      $inc: { likeCount: -1 },
    });

    return res.status(200).json({
      message: "Food Unliked Successfully",
      liked: false,
    });
  }

  const like = await likeModel.create({
    user: user._id,
    food: foodId,
  });

  await foodModel.findByIdAndUpdate(foodId, {
    $inc: { likeCount: 1 },
  });

  res.status(201).json({
    message: "Food Like Successfully",
    liked: true,
    like,
  });
}

async function saveFood(req, res) {
  const { foodId } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const isAlreadySaved = await saveModel.findOne({
    user: user._id,
    food: foodId,
  });
  if (isAlreadySaved) {
    await saveModel.deleteOne({
      user: user._id,
      food: foodId,
    });
    await foodModel.findByIdAndUpdate(foodId, {
      $inc: { saveCount: -1 },
    });
    return res.status(200).json({
      message: "Food Unsaved Successfully",
      saved: false,
    });
  }

  const save = await saveModel.create({
    user: user._id,
    food: foodId,
  });
  await foodModel.findByIdAndUpdate(foodId, {
    $inc: { saveCount: 1 },
  });
  res.status(201).json({
    message: "Food Saved Successfully",
    saved: true,
    save,
  });
}
module.exports = {
  createFood,
  getAllFood,
  likeFood,
  saveFood,
};
