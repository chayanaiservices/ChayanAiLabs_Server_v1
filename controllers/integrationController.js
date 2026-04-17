import userModel from "../models/userModels.js";

export const connectIntegrationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    const { provider } = req.body;

    if (provider === "google") {
      user.integrations.googleDrive = {
        connected: true,
        email: user.email,
      };
    }

    await user.save();

    res.send({
      success: true,
      message: "Integration connected",
      integrations: user.integrations,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false });
  }
};


export const disconnectIntegrationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    const { provider } = req.body;

    if (provider === "google") {
      user.integrations.googleDrive = {
        connected: false,
        email: null,
      };
    }

    await user.save();

    res.send({
      success: true,
      message: "Integration disconnected",
      integrations: user.integrations,
    });

  } catch (error) {
    res.status(500).send({ success: false });
  }
};