const { User } = require("../models/index");
const files = require("../utils/firebaseStorage");
const { getAllUsers, getUserById, getUserByUsername, updateUserById } = require('../utils/userHelpers');
const { getEntityById, updateEntityById, getAllEntities } = require('../utils/commonHelpers');
const handleError = require('../utils/errorHandler');


exports.getSingleUser = async (req, res, next) => {
  try {
    const user = await getEntityById(User, req.body.userId, { attributes: { exclude: ["password"] } });
    res.status(200).json({ message: "Fetched user successfully.", user: user });
  } catch (err) {
    handleError(err, next, "Error fetching single user");
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllEntities(User, { attributes: { exclude: ["password"] }});
    res.status(200).json({ users });
  } catch (err) {
    handleError(err, next, "Error fetching all users");
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await getUserByUsername(req.params.username);
    res
      .status(200)
      .json({ message: "User profile fetched successfully.", user: user });
  } catch (err) {
    handleError(err, next, "Error fetching user profile");
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const updatedProfile = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      country: req.body.country,
      city: req.body.city,
      organization: req.body.organization,
      birthdate: req.body.birthdate,
    };

    const user = await updateEntityById(User, req.userId, updatedProfile);
    res.status(200).json({ message: "Profile successfully updated", user });
  } catch (err) {
    handleError(err, next, "Error updating user profile");
  }
};

exports.updateUserAvatar = async (req, res, next) => {
  try {
    const avatar = await files.uploadImage(req, res);
    const user = await updateUserById(req.userId, { avatar });

    res
      .status(200)
      .json({ message: "Avatar successfully updated", user: user });
  } catch (err) {
    handleError(err, next, "Error updating user avatar");
  }
};

exports.getUserAvatar = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);
    const publicUrl = await files.getImage(user.avatar);
    res.status(200).json({ fileUrl: publicUrl });
  } catch (err) {
    handleError(err, next, "Error fetching user avatar");
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { username, email, firstName, lastName, country, city, limit } = req.query;
    const conditions = {};

    if (username) {
      conditions.username = { [Op.like]: `%${username}%` };
    }

    if (email) {
      conditions.email = { [Op.like]: `%${email}%` };
    }

    if (firstName) {
      conditions.firstName = { [Op.like]: `%${firstName}%` };
    }

    if (lastName) {
      conditions.lastName = { [Op.like]: `%${lastName}%` };
    }

    if (country) {
      conditions.country = { [Op.like]: `%${country}%` };
    }

    if (city) {
      conditions.city = { [Op.like]: `%${city}%` };
    }

    const options = {
      where: conditions,
      attributes: [
        'id', 
        'username', 
        'email', 
        'firstName', 
        'lastName', 
        'country', 
        'city', 
      ],
      limit: limit ? parseInt(limit, 10) : undefined
    };

    const users = await getAllEntities(User, options);
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      city: user.city,
    }));

    res.status(200).json({ users: formattedUsers });
  } catch (error) {
    handleError(error, next, "Error searching for users");
  }
};

