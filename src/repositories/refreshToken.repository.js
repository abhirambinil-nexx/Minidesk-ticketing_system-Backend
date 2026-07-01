import RefreshToken from "../models/RefreshToken.js";
import { Op } from "sequelize";

class RefreshTokenRepository {
  async create(data) {
    return await RefreshToken.create(data);
  }

  async findByTokenHash(tokenHash) {
    return await RefreshToken.findOne({
      where: {
        tokenHash,
      },
    });
  }

  async findByUserId(userId) {
    return await RefreshToken.findAll({
      where: {
        userId,
      },
      order: [["createdAt", "DESC"]],
    });
  }

  async revoke(id) {
    const token = await RefreshToken.findByPk(id);

    if (!token) return null;

    token.revoked = true;

    await token.save();

    return token;
  }

  async revokeAll(userId) {
    return await RefreshToken.update(
      {
        revoked: true,
      },
      {
        where: {
          userId,
        },
      },
    );
  }

  async deleteExpired() {
    return await RefreshToken.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
  }
  async deleteById(id) {
    return await RefreshToken.destroy({
      where: {
        id,
      },
    });
  }
}

export default new RefreshTokenRepository();
