import User from "../models/User.js";

export const findUserByEmailHash = async (emailHash) => {
  return await User.findOne({
    where: {
      email_hash: emailHash,
    },
  });
};

export const findUserById = async (id) => {
  return await User.findByPk(id);
};

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const getAllUsers = async () => {
  return await User.findAll();
};