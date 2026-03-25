const express =require("express");
const { getUserController, updateUserController, updatePasswordController, resetPasswordController, deleteUserController } = require("../controllers/userController.js");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

//routes

//GET USER || GET
router.get('/getUser',authMiddleware, getUserController)

//UPDATE USER
router.put('/updateUser',authMiddleware, updateUserController)

//UPDATE PASSWORDS
router.post('/updatePassword',authMiddleware, updatePasswordController)

//RESET PASSWORD
router.post('/resetPassword',authMiddleware, resetPasswordController)

//DELETE USER
router.delete('/deleteUser/:id',authMiddleware, deleteUserController)


module.exports = router;