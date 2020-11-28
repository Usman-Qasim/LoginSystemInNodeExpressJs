const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/code-save-api", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
