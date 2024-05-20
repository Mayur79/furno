const { hashPassword, comparePasword } = require("../helpers/authhelper");
const User = require("../model/userModel");
const JWT = require("jsonwebtoken");

const registerController = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    // Validation
    if (!name) {
      return res.send({ message: "Name is required" });
    }
    if (!email) {
      return res.send({ message: "Email is required" });
    }
    if (!password) {
      return res.send({ message: "Password is required" });
    }
    if (!confirmPassword) {
      return res.send({ message: "Password is required" });
    }
    if (password !== confirmPassword) {
      return res.send({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    // Existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already registered. Please log in.",
      });
    }

    // Register user
    const hashedPassword = await hashPassword(password);
    const user = await new User({
      name,
      email,
      password: hashedPassword,
      confirmPassword,
    }).save();
    res.status(203).send({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("email", email);
    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password." });
    }

    const user = await User.findOne({ email: email });

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email is not registered." });
    }

    // Compare passwords
    const isMatch = await comparePasword(password, user.password);
    console.log("is Mathc", isMatch);
    console.log("user password", user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Password." });
    }

    // Generate token
    const token = await JWT.sign(
      { _id: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error in login.", error });
  }
};
module.exports = { registerController, loginController };
