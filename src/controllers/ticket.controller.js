import * as ticketService from "../services/ticket.service.js";
import Ticket from "../models/Ticket.js";
import Tag from "../models/Tag.js";

export const createTicket = async (req, res) => {
  try {
    // Remove schema.parse() — just use req.body directly
    const { tags, ...ticketData } = req.body;

    // Create ticket
    const ticket = await ticketService.create(ticketData, req.user);

    // Attach tags if provided
    if (tags && tags.length > 0) {
      const tagRecords = await Tag.findAll({
        where: { id: tags },
      });
      await ticket.setTags(tagRecords);
    }

    // Fetch with tags and relationships
    const ticketWithTags = await Ticket.findByPk(ticket.id, {
      include: [
        { association: "requester", attributes: ["id", "name"] }, // ← removed email
        { association: "assignee", attributes: ["id", "name"] }, // ← removed email
        { association: "tags" },
      ],
    });

    res.status(201).json({
      success: true,
      data: ticketWithTags,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTickets = async (req, res) => {
  try {
    const result = await ticketService.getAll(req.user, req.query);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTicket = async (req, res) => {
  try {
    const ticket = await ticketService.getOne(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const ticket = await ticketService.update(
      req.params.id,
      req.body,
      req.user,
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const deleted = await ticketService.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
