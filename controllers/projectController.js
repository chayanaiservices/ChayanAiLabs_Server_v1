import projectModel from "../models/projectModel.js";
import userModel from "../models/userModels.js";

export const createProjectController = async (req, res) => {
    try {
        const { name, description } = req.body;

        const user = await userModel.findById(req.user.id);

        if (!user.team) {
            return res.status(400).send({
                success: false,
                message: "Join a team first",
            });
        }

        const project = await projectModel.create({
            name,
            description,
            team: user.team,
            createdBy: req.user.id,
        });

        res.send({
            success: true,
            message: "Project created",
            project,
        });

    } catch (error) {
        console.log("CREATE PROJECT ERROR:", error);
        res.status(500).send({ success: false });
    }
};

export const getProjectsController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);

        const projects = await projectModel
            .find({ team: user.team })
            .sort({ createdAt: -1 });

        res.send({
            success: true,
            projects,
        });

    } catch (error) {
        res.status(500).send({ success: false });
    }
};

export const getSingleProjectController = async (req, res) => {
    try {
        const project = await projectModel.findById(req.params.id);

        res.send({
            success: true,
            project,
        });

    } catch (error) {
        res.status(500).send({ success: false });
    }
};

export const updateProjectController = async (req, res) => {
    try {
        const { name, description, status } = req.body;

        const project = await projectModel.findByIdAndUpdate(
            req.params.id,
            { name, description, status },
            { new: true }
        );

        res.send({
            success: true,
            message: "Project updated",
            project,
        });

    } catch (error) {
        res.status(500).send({ success: false });
    }
};

export const deleteProjectController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);

        const project = await projectModel.findOne({
            _id: req.params.id,
            team: user.team,
        });
        res.send({
            success: true,
            message: "Project deleted",
        });

    } catch (error) {
        res.status(500).send({ success: false });
    }
};