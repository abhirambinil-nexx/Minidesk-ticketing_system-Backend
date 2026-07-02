import User from "../models/User.js";
import { Op } from "sequelize";

class UserRepository {
  async findAll() {
    return await User.findAll({
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });
  }

  async findById(id) {
    return await User.findByPk(id, {
      attributes: {
        exclude: ["password"],
      },
    });
  }

  async create(userData) {
    return await User.create(userData);
  }

  async update(id, userData) {
    const user = await User.findByPk(id);

    if (!user) return null;

    await user.update(userData);

    return user;
  }

  async deactivate(id) {
    const user = await User.findByPk(id);

    if (!user) return null;

    user.isActive = false;
    await user.save();

    return user;
  }

  async activate(id) {
    const user = await User.findByPk(id);

    if (!user) return null;

    user.isActive = true;
    await user.save();

    return user;
  }

  async changeRole(id, role) {
    const user = await User.findByPk(id);

    if (!user) return null;

    user.role = role;
    await user.save();

    return user;
  }

  async findByEmailHash(emailHash) {
    return await User.findOne({
      where: { email_hash: emailHash },
    });
  }

  async findAgents() {
    return await User.findAll({
      where: {
        isActive: true,
        role: {
          [Op.in]: ["agent", "admin"],
        },
      },
      attributes: ["id", "name", "role"],
      order: [["name", "ASC"]],
    });
  }
}
export default new UserRepository();
