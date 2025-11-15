const mogoose = require("mongoose");

const saveSchema = new mogoose.Schema(
  {
    user: {
      type: mogoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    food: {
      type: mogoose.Schema.Types.ObjectId,
      ref: "food",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const saveModel = mogoose.model("save", saveSchema);

module.exports = saveModel;
