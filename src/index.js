// Import required modules
const express = require("express");
require("./db/mongoose");
const productRouter = require("./route/product");
const userRouter = require("./route/user");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000; // Set port from environment variable or default to 3000

// Middleware
app.use(express.json());
app.use(cors());

app.use(productRouter);
app.use(userRouter);

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
