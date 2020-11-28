const User = require("../models/userModel");
const nodemailer = require("../utilities/email");

exports.setUsers = async (req, res) => {
  try {
    if (req.body.password === req.body.passwordConfirm) {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar: req.file.path,
      });
      await newUser.save();
      const token = await newUser.authToken();
      // Sending welcome Email
      const option = {
        email: "usmanqasim0900@gmail.com",
        subject: "++++ WELCOME TO CODE_SAVE ++++",
        text: "",
        html:
          "<b>Welcome to our website, this site is use to save your code into our database</b>",
      };
      await nodemailer.email(option);
      res.status(201).send({
        msg: "User Created Successfully",
        newUser,
        token,
      });
    } else {
      res.status(500).send({
        msg: "Password not matched",
      });
    }
  } catch (e) {
    res.status(400).send({
      msg: "Error in Create User",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send({
      msg: "User Get Successfully",
      users,
    });
  } catch (e) {
    res.status(500).send({
      msg: "Error is Data Getting",
      error: e,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.authToken();
    res.status(200).send({
      msg: "Login Successfully",
      user,
      token,
    });
  } catch (e) {
    res.status(400).send({
      msg: "Error in Login User",
      error: e,
    });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    // Deleting the token and returning all the others tokens
    req.user.tokens = req.user.tokens.filter((el) => el.token !== req.token);
    await req.user.save();
    res.send({ msg: "logout Successfully" });
  } catch (e) {
    res.status(500).send({
      msg: "Error in Loging Out",
      error: e,
    });
  }
};

exports.logoutUsers = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send({
      msg: "Logout all others Accounts",
    });
  } catch (e) {
    res.status(500).send({
      msg: "Error in Logging out from All Accounts",
      error: e,
    });
  }
};

exports.getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(404).send({ msg: "User not Found" });
    } else {
      res.status(200).send({
        msg: "User Get Successfully",
        user,
      });
    }
  } catch (e) {
    res.status(500).send({
      msg: "Error in Getting User",
      error: e,
    });
  }
};

exports.getMe = async (req, res) => {
  const user = req.user;
  res.send({
    msg: "Get Your Profile Successfully",
    user,
  });
};

exports.updateMe = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    res.status(400).send({
      msg: "Feild you choose to update is not Allowed",
    });
  }

  try {
    const user = req.user;
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.status(200).send({
      msg: "Data updated successfully",
      user,
    });
  } catch (e) {
    res.status(500).send({
      msg: "Error in Data updation",
      error: e,
    });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    const user = req.user;
    await user.remove();
    res.status(200).send({
      msg: "Data Deleted Successfully",
      user,
    });
  } catch (e) {
    res.status(500).send({
      msg: "Error in Data Deletion",
      error: e,
    });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).send({
        msg: "User with this email not found",
      });
    }
    // Creating Token to save in database and send it to the user
    const token = await user.resetToken();
    const option = {
      email: "addyouraccount@gmail.com",
      subject: "++++ Account Activation Link ++++",
      text:
        "Please Don't share this link. Otherwise we are not responsible for any Loss",
      html: `<h2> Please Click on given link to reset your password </h2>
      <p>${process.env.CLIENT_URL}/users/resetPassword/${token}</p>
      `,
    };
    await nodemailer.email(option);
    res.status(200).send({ msg: "Please check your email account" });
  } catch (e) {
    res.status(500).send({
      msg: "Error in forget password",
      error: e,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Extracting _id from JWT payload
    const jwt = req.params.jwt;
    let base64Payload = jwt.split(".")[1];
    var payload = Buffer.from(base64Payload, "base64");
    var payload = JSON.parse(payload.toString());
    const user = await User.findById(payload._id);
    if (!(user.passwordResetToken === jwt)) {
      res.send(500).send({ msg: "Error in Verifying Token" });
    }
    const passwordExpire = await user.updateOne({
      passwordResetExpires: Date.now(),
    });

    res.status(200).send({
      msg: "Please Enter the new Password",
      password: passwordExpire,
    });
  } catch (e) {
    res.status(500).send({
      msg: "Error in Reset password",
      error: e,
    });
  }
};

exports.changePassword = async (req, res) => {
  if (req.body.password === req.body.confirmPassword) {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User Not found");
      }
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.save();
      res.status(200).send({
        msg: "Password Updated Successfully",
      });
    } catch (e) {
      res.status(500).send({
        msg: "Error in Updating the Password",
        error: e,
      });
    }
  } else {
    res.status(500).send({
      msg: "Your Passwords are not same",
    });
  }
};
