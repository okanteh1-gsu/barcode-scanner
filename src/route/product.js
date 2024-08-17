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
    res.status(201).send(product);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Read all products
productRouter.get("/products", auth, async (req, res) => {
  const filter = {};
  console.log(req.query);

  if (req.query.name) {
    filter.name = req.query.name;
  }

  try {
    await req.user.populate({
      path: "products",
      match: filter, // Corrected the filter usage
      options: {
        skip: parseInt(req.query.skip, 10),
        limit: parseInt(req.query.limit, 10),
      },
    });
    res.send(req.user.products);
  } catch (e) {
    res.status(500).send(e);
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
      return res.status(404).send("Product Not Found.");
    }
    res.send(product);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Update product by id
productRouter.patch("/products/:id", auth, async (req, res) => {
  const objKeys = Object.keys(req.body);
  const allowedUpdates = ["price", "size", "discount"];
  const isValidOperation = objKeys.every((key) => allowedUpdates.includes(key));

  if (!isValidOperation) {
    return res.status(400).send("Invalid Operation.");
  }
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!product) {
      return res.status(404).send("Product not found");
    }
    objKeys.forEach((key) => (product[key] = req.body[key]));
    await product.save();

    res.send(product);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Delete product by id
productRouter.delete("/products/:id", auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id, // Corrected the usage here
    });

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.send(product);
  } catch (e) {
    res.status(500).send(e);
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
        return res.status(404).send("Product not found"); // Corrected typo
      }
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 800, height: 800 })
        .png()
        .toBuffer();
      product.image = buffer;
      await product.save();

      res.send("File uploaded");
    } catch (e) {
      res.status(500).send(e); // Changed to 500
    }
  },
  (error, req, res, next) => {
    if (error) {
      return res.status(400).send({ error: error.message });
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
      return res.status(404).send({ error: "Product not found" });
    }
    product.image = undefined;
    await product.save();

    res.send({ message: "Product image deleted successfully" });
  } catch (e) {
    res.status(400).send(e); // Changed to 400
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
      // Corrected conditional check
      return res.status(404).send({ error: "Image not found" });
    }
    res.set("Content-Type", "image/png");
    res.send(product.image);
  } catch (e) {
    res.status(400).send(e); // Changed to 400
  }
});

module.exports = productRouter;
