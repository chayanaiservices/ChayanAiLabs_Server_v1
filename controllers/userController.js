const userModels = require("../models/userModels");
const bcrypt = require("bcrypt");

const getUserController = async (req, res) => {
    try {
        // Get user ID from auth middleware
        const userId = req.user.id;   // <── THIS IS THE FIX

        // Find user by ID
        const user = await userModels.findById(userId).select("-password");

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "User fetched successfully",
            user,
        });

    } catch (error) {
        console.log("Get User Error:", error);
        res.status(500).send({
            success: false,
            message: "Error in Get User API",
            error: error.message || error,
        });
    }
};

//UPDATE USER

const updateUserController = async (req, res) => {
    try {
        // find user 
        const user = await userModels.findById(req.user.id)
        //validation
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            })
        }
        //Update
        const { username, address, phone, profile } = req.body
        if (username) user.username = username
        if (profile) user.profile = profile
        if (address) user.address = address
        if (phone) user.phone = phone

        //save user
        await user.save()
        res.status(200).send({
            success: true,
            message: "User Updated Successfully"
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Update User API",
        })
    }
}

//Update Password

const updatePasswordController = async (req, res) => {
  try {
    // Logged-in user ID from token
    const userId = req.user.id;  // <── FIXED

    const user = await userModels.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "USER NOT FOUND"
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Please Provide Old & New Password"
      });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "Invalid Old Password"
      });
    }

    // Hash and save new password
    const salt = bcrypt.genSaltSync(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).send({
      success: true,
      message: "Password Changed Successfully"
    });

  } catch (error) {
    console.log("Update Password Error:", error);
    res.status(500).send({
      success: false,
      message: "Error in Password Update API",
      error: error.message
    });
  }
};


//reset Password

const resetPasswordController = async (req, res) => {
  try {
    const {email, newPassword, answer} = req.body;
    if(!email || !newPassword || !answer){
      return res.status(500).send({
        success:false,
        message:"Please Provide all Fields"
      });
    };
    const user = await userModels.findOne({email})
    if(!user){
      return res.status(500).send({
        success:false,
        message: "User not Found",
      })
    }

    const ans = await userModels.findOne({answer})
    if(!ans){
      return res.status(500).send({
        success:false,
        message: "Wrong Answer",
      })
    }

    var salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;

    await user.save();

    res.status(200).send({
      success: true,
      message: "Password Reset Successfully"
    })


  } catch (error) {
    console.log(error);
    res.status(500).send({
      success:false,
      message: "Error in reset Password API",
    })
  }
}

const deleteUserController = async (req,res) => {
  try {
    await userModels.findByIdAndDelete(req.params.id)
    return res.status(200).send({
      success: true,
      message: 'User Deleted Successfully'
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Delete User API",
      error,
    })
  }
}

module.exports = {
    getUserController,
    updateUserController,
    updatePasswordController,
    resetPasswordController,
    deleteUserController
};
