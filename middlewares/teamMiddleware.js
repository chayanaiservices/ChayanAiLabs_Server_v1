import userModel from "../models/userModels.js";

const teamMiddleware = async (req, res, next) => {
  const user = await userModel.findById(req.user.id);

  if (!user.team) {
    return res.status(403).send({
      success: false,
      message: "You must join a team first",
    });
  }

  req.teamId = user.team;
  next();
};

export default teamMiddleware;