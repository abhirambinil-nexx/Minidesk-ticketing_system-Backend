import * as service from "../services/statusHistory.service.js";

export const getHistory = async (req, res) => {
  try {
    const history = await service.getAll(req.params.ticketId);

    res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
