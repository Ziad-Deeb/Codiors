const { User, Role } = require("../models/index");
const CustomError = require("../errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    let { email, username } = req.body;
    const { password, confirmPassword } = req.body;

    if (!username) {
      throw new CustomError.BadRequestError("Please provide a username");
    }

    if (!email) {
      throw new CustomError.BadRequestError("Please provide an email");
    }

    if (password !== confirmPassword) {
      throw new CustomError.BadRequestError(
        "Password and confirm password do not match"
      );
    }

    email = email.toLowerCase();
    const emailAlreadyExists = await User.findOne({ where: { email } });
    if (emailAlreadyExists) {
      throw new CustomError.BadRequestError("Email already exists");
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(username)) {
      throw new CustomError.BadRequestError(
        "Username can only contain letters, numbers, periods, and underscores"
      );
    }

    username = username.toLowerCase();
    const usernameAlreadyExists = await User.findOne({ where: { username } });
    if (usernameAlreadyExists) {
      throw new CustomError.BadRequestError("Username already exists");
    }

    // first registered user is an admin
    const isFirstAccount = (await User.count()) === 0;
    let role;

    if (isFirstAccount) {
      role = await Role.findOne({ where: { name: "admin" } });
    } else {
      role = await Role.findOne({ where: { name: "user" } });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      registrationTime: Date.now(),
    });

    if (role) {
      await newUser.addRole(role);
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    if (!err) {
      throw new CustomError.InternalServerError();
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  let { username } = req.body;
  const { password } = req.body;

  if (!username || !password) {
    throw new CustomError.BadRequestError(
      "Please provide username and password"
    );
  }

  username = username.toLowerCase();
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const token = jwt.sign(
    { username: user.username, userId: user.id.toString(), role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "90d" }
  );

  res.status(200).json({ token, userId: user.id.toString(), username });
};
