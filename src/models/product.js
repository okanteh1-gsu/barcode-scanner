const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    barcode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    size: {
      type: String,
      trim: true,
    },
    discount: {
      type: Number,
      min: 0,
    },
    image: {
      type: Buffer,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Delete image from database

productSchema.methods.toJSON = function () {
  const product = this;
  const productObj = product.toObject();

  delete productObj.image;

  return productObj;
};

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
