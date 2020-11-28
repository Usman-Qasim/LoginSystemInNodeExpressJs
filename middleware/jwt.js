const User = require("../models/userModel");
const jwt = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error();
    }

    if (user.passwordResetExpires < Date.now()) {
      next();
    } else {
      res.send({
        msg: "Error Yor are mashqooq person",
      });
    }
  } catch (e) {
    res
      .status(401)
      .send({ message: "you are not authorize to access this resource" });
  }
};

module.exports = jwt;
