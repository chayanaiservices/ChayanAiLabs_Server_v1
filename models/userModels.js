const mongoose = require("mongoose");


//schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is Required"]
  },
  email: {
    type: String,
    required: [true, "Email is Required"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password is Required"]
  },
  address: {
    type: Array
  },
  phone: {
    type: String,
    required: [true, "Phone Number is Required"]
  },
  userType: {
    type: String,
    required: true,
    default: "Client",
    enum: ["Client", "Admin", "Vender", "Driver"]
  },
  profile: {
    type: String,
    default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5jifLXKb2qo_5aXh54USNlvxI34oPpG3zTw&s"
  },
  answer: {
    type: String
  }
}, { timestamps: true }
);

//export

module.exports = mongoose.model('User', userSchema)

