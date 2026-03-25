const { hash } = require("bcryptjs");
const userModels = require("../models/userModels");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const registerController = async (req, res) => {
    try {
        const { username, email, password, phone, address, answer } = req.body

        //Validation
        if (!username || !email || !password || !phone || !address || !answer) {
            return res.status(500).send({
                success: false,
                message: "Please fill all the Required Fields"
            });
        }
        //Check User
        const existingUser = await userModels.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            if (existingUser.email === email && existingUser.phone === phone) {
                return res.status(400).send({
                    success: false,
                    message: "Both Email and Phone Already Registered"
                });
            }
            else if (existingUser.email === email) {
                return res.status(400).send({
                    success: false,
                    message: "Email Already Registered"
                });
            }
            else if (existingUser.phone === phone) {
                return res.status(400).send({
                    success: false,
                    message: "Phone Number Already Registered"
                });
            }
        }

        //hashing
        var salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        //Create new User
        const user = await userModels.create({
            username,
            email,
            password: hashedPassword,
            address,
            phone,
            answer,
        })
        res.status(201).send({
            success: true,
            message: "User Registered Successfully"
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            messsage: "Error in Registration API"
        })
    }
}

//LOGIN
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body
        //validation
        if (!email || !password) {
            return res.status(500).send({
                success: false,
                message: "Please Enter Email and Password"
            })
            console.log("RAW BODY:", req.body);
        }
        //check user
        const user = await userModels.findOne({ email })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not Found"
            })
        }

        //check user pasword || compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(200).send({
                success: false,
                message: "Invalid Credentials"
            })
        }

        //token
        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        })


        res.status(200).send({
            success: true,
            message: "Login Successfully",
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Login API"
        })
    }
}

module.exports = { 
    registerController, 
    loginController
};
