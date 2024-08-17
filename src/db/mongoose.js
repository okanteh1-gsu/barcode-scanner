const mongoose = require("mongoose");

const connectionURL =
  "mongodb+srv://okanteh1:Gsustudent1@cluster0.ze6bia7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(connectionURL)
  .then(() => {
    console.log("Mongoose connected");
  })
  .catch((e) => {
    console.log(e);
  });

// {
//   "name": "task-manager1",
//   "version": "1.0.0",
//   "description": "",
//   "main": "index.js",
//   "scripts": {
//     "start": "node src/index.js",
//     "dev": "nodemon src/index.js"
//   },
//   "dependencies": {
//     "bcryptjs": "^2.4.3",
//     "express": "^4.19.2",
//     "jsonwebtoken": "^9.0.2",
//     "mongodb": "^6.6.0",
//     "mongoose": "^8.3.3",
//     "multer": "^1.4.5-lts.1",
//     "nodemon": "^3.1.0",
//     "sharp": "^0.33.4",
//     "validator": "^13.11.0"
//   }
// }
