import * as tagService from "../services/tag.service.js";

export const createTag = async (req, res) => {
  try {
    const tag = await tagService.create(req.body);
    return res.status(201).json({ success: true, data: tag });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getTags = async (req, res) => {
  try {
    const tags = await tagService.getAll();
    return res.json({ success: true, data: tags });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTag = async (req, res) => {
  try {
    const tag = await tagService.getOne(req.params.id);
    return res.json({ success: true, data: tag });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const updateTag = async (req, res) => {
  try {
    const tag = await tagService.update(req.params.id, req.body);
    return res.json({ success: true, data: tag });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTag = async (req, res) => {
  try {
    await tagService.remove(req.params.id);
    return res.json({ success: true, message: "Tag deleted" });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
