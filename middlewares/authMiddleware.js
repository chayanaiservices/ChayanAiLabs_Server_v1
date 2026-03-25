const JWT = require("jsonwebtoken");
const userModel = require("../models/userModels");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB using decoded.id
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }

    // Store full user object
    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Auth failed",
      error,
    });
  }
};