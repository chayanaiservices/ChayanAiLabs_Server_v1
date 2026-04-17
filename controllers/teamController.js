import teamModel from "../models/teamModels.js";
import userModel from "../models/userModels.js";
import billingModel from "../models/billingModels.js";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "../utils/logActivity.js";

const planLimits = {
  free: 1,
  starter: 3,
  growth: 10,
  scale: 1000,
};


export const createTeamController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const existingUser = await userModel.findById(userId);

    if (existingUser.team) {
      return res.status(400).send({
        success: false,
        message: "User already in a team",
      });
    }

      if (existingUser.role !== "Owner") {
      const billing = await billingModel.findOne({ user: userId });

      if (!billing || billing.status !== "active") {
        return res.status(403).send({
          success: false,
          message: "Purchase a plan first",
        });
      }
    }

    const team = await teamModel.create({
      name,
      owner: userId,
      teamId: uuidv4(),
      members: [
        {
          user: userId,
          role: "admin",
        },
      ],
    });

    existingUser.team = team._id;
    await existingUser.save();

    res.send({
      success: true,
      team,
    });

  } catch (error) {
    res.status(500).send({ success: false });
  }
};


export const joinTeamController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId } = req.body;

    const planLimits = {
      free: 1,
      starter: 3,
      growth: 10,
      scale: 1000,
    };

    const user = await userModel.findById(userId);

    if (user.team) {
      return res.status(400).send({
        success: false,
        message: "Already in a team",
      });
    }

    const team = await teamModel.findOne({ teamId });

    if (!team) {
      return res.status(404).send({
        success: false,
        message: "Team not found",
      });
    }

    if (team.owner.toString() === userId) {
      return res.status(400).send({
        success: false,
        message: "Owner is already in team",
      });
    }

    if (team.members.some(m => m.user.toString() === userId)) {
      return res.status(400).send({
        success: false,
        message: "Already a member",
      });
    }

    const ownerUser = await userModel.findById(team.owner);

    let limit;

    if (ownerUser.role === "Owner") {
      limit = Infinity;
    } else {
      const billing = await billingModel.findOne({ user: team.owner });
      limit = planLimits[billing?.plan || "free"];
    }

    if (team.members.length >= limit) {
      return res.status(403).send({
        success: false,
        message: `Team limit reached for ${plan} plan`,
      });
    }

    team.members.push({
      user: userId,
      role: "member",
    });

    await team.save();

    user.team = team._id;
    await user.save();

    res.send({
      success: true,
      message: "Joined team successfully",
      teamId: team._id,
    });
    await logActivity({
      action: "Joined team",
      userId,
      teamId: team._id,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};


export const getMyTeamController = async (req, res) => {
  try {
    const team = await teamModel
      .findOne({ "members.user": req.user.id })
      .populate("members.user", "username email avatar");

    if (!team) {
      return res.status(200).send({
        success: true,
        team: null,
        message: "No team found",
      });
    }

    res.send({
      success: true,
      team,
    });
  } catch (error) {
    res.status(500).send({ success: false });
  }
};

export const inviteMemberController = async (req, res) => {
  try {
    const team = await teamModel.findOne({ "members.user": req.user.id });

    if (!team) {
      return res.status(404).send({
        success: false,
        message: "Team not found",
      });
    }

    res.send({
      success: true,
      teamId: team.teamId,
    });
  } catch (error) {
    res.status(500).send({ success: false });
  }
};

export const removeMemberController = async (req, res) => {
  try {
    const { userId } = req.body;

    const team = await teamModel.findOne({ owner: req.user.id });

    team.members = team.members.filter(
      (m) => m.user.toString() !== userId
    );

    await team.save();

    res.send({
      success: true,
      message: "Member removed",
    });

  } catch (error) {
    res.status(500).send({ success: false });
  }
};

export const changeRoleController = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const team = await teamModel.findOne({ owner: req.user.id });

    const member = team.members.find(
      (m) => m.user.toString() === userId
    );

    if (member) {
      member.role = role;
      await team.save();
    }

    res.send({
      success: true,
      message: "Role updated",
    });

  } catch (error) {
    res.status(500).send({ success: false });
  }
};

export const leaveTeamController = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId);

    if (!user.team) {
      return res.status(400).send({
        success: false,
        message: "Not part of any team",
      });
    }

    const team = await teamModel.findById(user.team);

    if (!team) {
      return res.status(404).send({
        success: false,
        message: "Team not found",
      });
    }

    if (team.owner.toString() === userId) {
      return res.status(400).send({
        success: false,
        message: "Owner cannot leave the team",
      });
    }

    team.members = team.members.filter(
      (m) => m.user.toString() !== userId
    );

    await team.save();

    user.team = null;
    await user.save();
f
    res.send({
      success: true,
      message: "Left team successfully",
    });

  } catch (error) {
    console.log("LEAVE TEAM ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};