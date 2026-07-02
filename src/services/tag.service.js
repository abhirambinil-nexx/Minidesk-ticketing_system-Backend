import * as tagRepository from "../repositories/tag.repository.js";

export const create = async (data) => {
  const existing = await tagRepository.getTagByName(data.name);
  if (existing) {
    throw new Error("Tag with this name already exists");
  }
  return await tagRepository.createTag(data);
};

export const getAll = async () => {
  return await tagRepository.getAllTags();
};

export const getOne = async (id) => {
  const tag = await tagRepository.getTagById(id);
  if (!tag) throw new Error("Tag not found");
  return tag;
};

export const update = async (id, data) => {
  const tag = await tagRepository.updateTag(id, data);
  if (!tag) throw new Error("Tag not found");
  return tag;
};

export const remove = async (id) => {
  const deleted = await tagRepository.deleteTag(id);
  if (!deleted) throw new Error("Tag not found");
  return true;
};
