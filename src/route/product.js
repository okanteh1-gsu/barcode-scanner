const auth = require("../middleware/auth");
const Product = require("../models/product");
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const productRouter = express.Router();

// Create a new product
productRouter.post("/products", auth, async (req, res) => {
  const product = new Product({ ...req.body, owner: req.user._id });
  try {
    await product.save();
    res.status(201).json(product);
  } catch (e) {
    res.status(500).json(e);
  }
});

// Read all products
productRouter.get("/products", auth, async (req, res) => {
  const filter = {};

  if (req.query.name) {
    filter.name = req.query.name;
  }

  try {
    await req.user.populate({
      path: "products",
      match: filter,
      options: {
        skip: parseInt(req.query.skip, 10),
        limit: parseInt(req.query.limit, 10),
      },
    });
    res.json(req.user.products);
  } catch (e) {
    res.status(500).json(e);
  }
});

// Read product by barcode
productRouter.get("/products/:barcode", auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      barcode: req.params.barcode,
      owner: req.user._id,
    });
    if (!product) {
      return res.status(404).json("Product Not Found.");
    }
    res.json(product);
  } catch (e) {
    res.status(500).json(e);
  }
});

// Update product by id
productRouter.patch("/products/:id", auth, async (req, res) => {
  const objKeys = Object.keys(req.body);
  const allowedUpdates = ["price", "size", "discount"];
  const isValidOperation = objKeys.every((key) => allowedUpdates.includes(key));

  if (!isValidOperation) {
    return res.status(400).json("Invalid Operation.");
  }
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!product) {
      return res.status(404).json("Product not found");
    }
    objKeys.forEach((key) => (product[key] = req.body[key]));
    await product.save();

    res.json(product);
  } catch (e) {
    res.status(500).json(e);
  }
});

// Delete product by id
productRouter.delete("/products/:id", auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!product) {
      return res.status(404).json("Product not found");
    }

    res.json(product);
  } catch (e) {
    res.status(500).json(e);
  }
});

// Add images
const upload = multer({
  limits: {
    fileSize: 1000000, // 1 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, and GIF images are allowed."
        )
      );
    }
    cb(undefined, true);
  },
});

// Upload route
productRouter.post(
  "/products/:id/upload",
  upload.single("image"),
  auth,
  async (req, res) => {
    try {
      const product = await Product.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });
      if (!product) {
        return res.status(404).json("Product not found");
      }
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 800, height: 800 })
        .png()
        .toBuffer();
      product.image = buffer;
      await product.save();

      res.json("File uploaded");
    } catch (e) {
      res.status(500).json(e);
    }
  },
  (error, req, res, next) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }
);

// Delete Uploaded Image
productRouter.delete("/products/:id/image", auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    product.image = undefined;
    await product.save();

    res.json({ message: "Product image deleted successfully" });
  } catch (e) {
    res.status(400).json(e);
  }
});

// Get product image
productRouter.get("/products/:id/image", auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!product || !product.image) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.set("Content-Type", "image/png");
    res.send(product.image);
  } catch (e) {
    res.status(400).json(e);
  }
});

module.exports = productRouter;
