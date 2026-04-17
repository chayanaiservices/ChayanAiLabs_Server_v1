import activityModel from "../models/activityModel.js";

export const logActivity = async ({ action, userId, teamId, meta = {} }) => {
  try {
    await activityModel.create({
      action,
      user: userId,
      team: teamId,
      meta,
    });
  } catch (error) {
    console.log("ACTIVITY LOG ERROR:", error);
  }
};