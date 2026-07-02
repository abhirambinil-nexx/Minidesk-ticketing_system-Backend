import Tag from "../models/Tag.js";

export const createTag = async (data) => {
  return await Tag.create(data);
};

export const getAllTags = async () => {
  return await Tag.findAll({
    order: [["name", "ASC"]],
  });
};

export const getTagById = async (id) => {
  return await Tag.findByPk(id);
};

export const getTagByName = async (name) => {
  return await Tag.findOne({ where: { name } });
};

export const updateTag = async (id, data) => {
  const tag = await Tag.findByPk(id);
  if (!tag) return null;
  return await tag.update(data);
};

export const deleteTag = async (id) => {
  const tag = await Tag.findByPk(id);
  if (!tag) return false;
  await tag.destroy();
  return true;
};