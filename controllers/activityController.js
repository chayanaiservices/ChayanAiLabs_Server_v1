import activityModel from "../models/activityModel.js";

export const getActivityController = async (req, res) => {
  try {
    const logs = await activityModel
      .find({ team: req.user.team })
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.send({
      success: true,
      logs,
    });

  } catch (error) {
    console.log("ACTIVITY ERROR:", error);
    res.status(500).send({ success: false });
  }
};