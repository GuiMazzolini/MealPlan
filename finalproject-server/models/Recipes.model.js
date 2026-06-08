const { Schema, model } = require("mongoose");

const recipesSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required."],
    },
    time: {
      type: String,
      required: [true, "Time is required."],
    },
    serving: {
        type: Number,
        required: [true, "Serving is required."],
      },
    ingredients: [{quantity: Number ,
                  measure: String,
                  ingredient: String}],

    prepare: [String],

    imageUrl: String,

    quantity: Number,

    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }

);

const Recipes = model("Recipes", recipesSchema);

module.exports = Recipes;
