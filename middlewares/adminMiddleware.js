import userModel from "../models/userModels.js";

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user || user.role !== "Owner") {
      return res.status(403).send({
        success: false,
        message: "Access denied",
      });
    }

    next();
  } catch (error) {
    console.log("ADMIN MIDDLEWARE ERROR:", error);
    res.status(500).send({ success: false });
  }
};

export default adminMiddleware;