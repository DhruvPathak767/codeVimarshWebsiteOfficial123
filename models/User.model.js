import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: 3,
      maxlength: 50
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false
    },

    prnNumber: {
      type: String,
      required: [true, "PRN number is required"],
      unique: true,
      trim: true
    },

    class: {
      type: String,
      required: [true, "Class is required"],
      trim: true
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

   

   
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema); 