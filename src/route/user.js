const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");

const userRouter = express.Router();

// Create User
userRouter.post("/users", async (req, res) => {
  console.log("Incoming request body:", req.body);
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });

    const token = await user.generateAuthToken();

    await user.save();
    console.log(user);

    res.status(201).json({ user, token });
  } catch (e) {
    res.status(500).json(e);
  }
});

// Login user
userRouter.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.json({ user, token });
    console.log(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Logout user
userRouter.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );

    await req.user.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (e) {
    res.status(500).json({ error: "Logout failed" });
  }
});

// Read all Users
userRouter.get("/users/me", auth, async (req, res) => {
  res.json(req.user);
});

// Update User
userRouter.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.json(req.user); //
  } catch (e) {
    res.status(400).json(e);
  }
});

// Delete User
userRouter.delete("/users/me", auth, async (req, res) => {
  try {
    await User.deleteOne({ _id: req.user._id });
    res.json({ message: "User deleted successfully." });
  } catch (e) {
    res.status(400).json(e);
  }
});

module.exports = userRouter;
