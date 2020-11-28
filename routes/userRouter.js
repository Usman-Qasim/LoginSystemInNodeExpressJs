const userController = require("../controllers/userController");
const avatar = require("../middleware/avatar");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const jwt = require("../middleware/jwt");
const express = require("express");
const router = express.Router();

router.get("/me", auth, userController.getMe);
router.post("/login", userController.loginUser);
router.get("/logout", auth, userController.logoutUser);
router.get("/logoutAll", auth, userController.logoutUsers);
router.get("/:id", [auth, admin], userController.getUser);
router.patch("/me", auth, userController.updateMe);
router.delete("/me", auth, userController.deleteMe);
router.get("/", [auth, admin], userController.getUsers);
router.post("/forgetPassword", userController.forgetPassword);
router.get("/resetPassword/:jwt", userController.resetPassword);
router.post("/changePassword", jwt, userController.changePassword);
router.post("/", avatar.upload.single("avatar"), userController.setUsers);

module.exports = router;
