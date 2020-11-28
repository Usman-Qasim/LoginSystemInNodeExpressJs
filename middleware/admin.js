const admin = async (req, res, next) => {
  try {
    if (req.user.status === "admin") {
      next();
    } else {
      throw new Error();
    }
  } catch (e) {
    res
      .status(401)
      .send({ message: "you are not authorize to access this resource" });
  }
};
module.exports = admin;
