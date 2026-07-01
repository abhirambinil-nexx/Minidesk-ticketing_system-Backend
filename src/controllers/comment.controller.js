import * as commentService from "../services/comment.service.js";

export const createComment = async (req, res) => {
  try {
    const comment = await commentService.create(
      req.params.ticketId,
      req.body.body,
      req.user
    );

    res.status(201).json({
      success: true,
      data: comment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await commentService.getAll(req.params.ticketId);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};