const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: function () {
        return this.role !== "main_admin";
      },
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["main_admin", "society_admin", "member", "staff"],
      default: "member",
    },
    profileImage: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    memberDetails: {
      flatNumber: {
        type: String,
        default: "",
      },
      wing: {
        type: String,
        default: "",
      },
      floor: {
        type: Number,
        default: 1,
      },
      occupation: {
        type: String,
        default: "",
      },
      emergencyContact: {
        type: String,
        default: "",
      },
      vehicleNumbers: [
        {
          type: {
            type: String,
            enum: ["2_wheeler", "4_wheeler"],
            default: "4_wheeler",
          },
          number: String,
        },
      ],
      familyMembers: [
        {
          name: String,
          relationship: String,
          age: Number,
          contact: String,
        },
      ],
      moveInDate: {
        type: Date,
        default: Date.now,
      },
      isOwner: {
        type: Boolean,
        default: true,
      },
    },
    staffDetails: {
      designation: String, // e.g. 'Electrician', 'Security Guard', 'Plumber', 'Manager'
      shift: String, // e.g. 'Morning (8AM - 4PM)'
      emergencyContact: String,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

// Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
