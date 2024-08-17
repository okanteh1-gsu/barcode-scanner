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
    filter.name = req.query.name === "Coca-cola";
  }

  try {
    // const products = await Product.find({ owner: req.user._id });
    await req.user.populate({
      path: "products",
      filter,
      options: {
        skip: parseInt(req.query.skip),
        limit: parseInt(req.query.limit),
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
      owner: req.user,
    });

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.send(product);
  } catch (e) {
    res.status(500).send(e);
  }
});

// add images
const upload = multer({
  limits: {
    fileSize: 1000000,
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
        return res.status(404).send("Proudct not found");
      }
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 800, height: 800 })
        .png()
        .toBuffer();
      product.image = buffer;
      await product.save();

      res.send("File uploaded");
    } catch (e) {
      res.status(404).send(e);
    }
  },
  (error, req, res, next) => {
    if (error) {
      return res.status(400).send({ error: error.message });
    }
  }
);

// Delete Uploaded
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
    res.status(400).send(e);
  }
});

// Get product image
productRouter.get("/products/:id/image", auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!product || product.image) {
      return res.status(404).send({ error: "Image not found" });
    }
    res.set("Content-Type", "image/png");

    res.send(product.image);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = productRouter;

// const express = require("express");
// const Task = require("../models/task");
// const auth = require("../middleware/auth");
// const task_router = new express.Router();

// task_router.post("/tasks", auth, async (req, res) => {
//   const task = new Task({
//     ...req.body,
//     owner: req.user._id,
//   });
//   try {
//     await task.save();
//     res.status(201).send(task);
//   } catch (e) {
//     res.status(400).send(e);
//   }
// });

// task_router.get("/tasks", auth, async (req, res) => {
//   try {
//     const match = {};
//     const sort = {};
//     if (req.query.sortBy) {
//       const parts = req.query.sortBy.split(":");
//       sort[parts[0]] = parts[1] == "desc" ? -1 : 1;
//     }

//     if (req.query.completed) {
//       match.completed = req.query.completed == "true";
//     }
//     await req.user.populate({
//       path: "tasks",
//       match,
//       options: {
//         limit: parseInt(req.query.limit),
//         skip: parseInt(req.query.skip),
//         sort,
//       },
//     });
//     res.send(req.user.tasks);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

// task_router.get("/tasks/:id", auth, async (req, res) => {
//   const _id = req.params.id;
//   try {
//     const task = await Task.findOne({ _id, owner: req.user._id });
//     if (!task) {
//       return res.status(404).send();
//     }
//     res.send(task);
//   } catch (e) {
//     res.status(400).send();
//   }
// });

// task_router.patch("/tasks/:id", auth, async (req, res) => {
//   const task_keys = Object.keys(req.body);

//   const allowed_task = ["description", "completed"];

//   const isValidOperation = task_keys.every((task_key) => {
//     return allowed_task.includes(task_key);
//   });
//   if (!isValidOperation) {
//     res.status(404).send({ error: "Invalid task!" });
//   }
//   try {
//     const task = await Task.findOne({
//       _id: req.params.id,
//       owner: req.user._id,
//     });

//     if (!task) {
//       return res.status(404).send();
//     }
//     task_keys.forEach((task_key) => (task[task_key] = req.body[task_key]));

//     await task.save();

//     res.send(task);
//   } catch (e) {
//     res.send(400).send(e);
//   }
// });

// task_router.delete("/tasks/:id", auth, async (req, res) => {
//   const task = await Task.findOneAndDelete({
//     _id: req.params.id,
//     owner: req.user._id,
//   });

//   try {
//     if (!task) {
//       return res.status(404).send();
//     }
//     res.send(task);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

// module.exports = task_router;
