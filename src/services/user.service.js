import bcrypt from "bcrypt";
import userRepository from "../repositories/user.repository.js";
import { decryptEmail } from "../utils/crypto.js";

class UserService {
  async getAllUsers() {
    const users = await userRepository.findAll();

    return users.map((user) => {
      const data = user.toJSON();

      return {
        ...data,
        email: decryptEmail(data.email_cipher),
      };
    });
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    const data = user.toJSON();

    return {
      id: data.id,
      name: data.name,
      email: decryptEmail(data.email_cipher),
      role: data.role,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async createUser(userData) {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = {
      ...userData,
      password: hashedPassword,
    };

    return await userRepository.create(newUser);
  }

  async updateUser(id, userData) {
    const updatedUser = await userRepository.update(id, userData);

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  async deactivateUser(id) {
    const user = await userRepository.deactivate(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async activateUser(id) {
    const user = await userRepository.activate(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async changeUserRole(id, role) {
    const user = await userRepository.changeRole(id, role);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
  async getAgents() {
    const agents = await userRepository.findAgents();

    return agents.map((agent) => {
      const data = agent.toJSON();

      return {
        id: data.id,
        name: data.name,
        role: data.role,
      };
    });
  }
}

export default new UserService();
