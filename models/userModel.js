// PasswordReset functionalities are not yed included in this Model
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Username"],
      trim: true,
      lowercase: true,
      unique: true,
      minlength: 6,
    },
    email: {
      type: String,
      required: [true, "Please Enter Email"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please Enter a Valid Email"],
    },
    password: {
      type: String,
      required: [true, "Please Enter Password 8 Character long"],
      minlength: 8,
      trim: true,
      select: false,
    },
    avatar: {
      type: String,
      default: "default.jpg",
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    status: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Create password, first time
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generating token and Add to the Array
userSchema.methods.authToken = async function () {
  const token = jwt.sign(
    {
      _id: this._id.toString(),
    },
    process.env.JWT_SECRET
  );
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

userSchema.methods.resetToken = async function () {
  const token = jwt.sign(
    {
      _id: this._id.toString(),
    },
    process.env.JWT_RESET_SECRET
  );
  this.passwordResetToken = token;
  await this.save();
  return token;
};

// Delete Secret data before returning the response
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject.__v;
  return userObject;
};

// Applying Query in model, Custome Query
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid Credentials");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid Credentials");
  }
  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
