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
