require("./utilities/dbConnection");
const dotenv = require("dotenv");
const express = require("express");
const userRouter = require("./routes/userRouter");

dotenv.config();
const app = express();
app.use(express.json());
app.use("/users", userRouter);
app.use(express.static("uploads")); // you have to change it manually

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("App is running on PORT " + port);
});
