const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");

const userRouter = express.Router();

// Create User
userRouter.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(500).send(e);
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
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Logout user
userRouter.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );

    await req.user.save();

    res.status(200).send({ message: "Logout successful" });
  } catch (e) {
    res.status(500).send({ error: "Logout failed" });
  }
});

// Read all Users
userRouter.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// Update User
userRouter.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete User
userRouter.delete("/users/me", auth, async (req, res) => {
  try {
    await User.deleteOne({ _id: req.user._id }); // Corrected to use req.user._id
    res.send({ message: "User deleted successfully." });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = userRouter;
