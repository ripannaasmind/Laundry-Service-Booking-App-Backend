import Ticket from "../model/ticket.model.js";
import User from "../model/user.model.js";

// ========== USER SERVICES ==========

// User: Create a new support ticket
export const CreateTicketService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { subject, description, category, priority, relatedOrder } = req.body;
    if (!subject || !description) {
      return { status: "failed", message: "Subject and description are required" };
    }

    const ticket = await Ticket.create({
      user: userId,
      subject,
      description,
      category: category || "other",
      priority: priority || "medium",
      relatedOrder: relatedOrder || null,
      notes: [{ by: userId, byRole: "user", message: description }],
    });

    return { status: "success", message: "Support ticket created successfully", data: ticket };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// User: Get my tickets
export const GetMyTicketsService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { status: filterStatus, page = 1, limit = 20 } = req.query;
    const filter = { user: userId };
    if (filterStatus && filterStatus !== "all") filter.status = filterStatus;

    const tickets = await Ticket.find(filter)
      .populate("assignedTo", "name email phone role")
      .populate("relatedOrder", "orderId totalPayment status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await Ticket.countDocuments(filter);
    return {
      status: "success",
      data: { tickets, total, page: parseInt(page, 10), totalPages: Math.ceil(total / limit) },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// User: Get single ticket detail
export const GetTicketDetailService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { id } = req.params;
    const ticket = await Ticket.findOne({ _id: id, user: userId })
      .populate("assignedTo", "name email phone role")
      .populate("relatedOrder", "orderId totalPayment status")
      .populate("notes.by", "name role profileImage");

    if (!ticket) return { status: "failed", message: "Ticket not found" };
    return { status: "success", data: ticket };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// User: Add a note/reply to own ticket
export const AddTicketNoteService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { id } = req.params;
    const { message } = req.body;
    if (!message) return { status: "failed", message: "Message is required" };

    const ticket = await Ticket.findOne({ _id: id, user: userId });
    if (!ticket) return { status: "failed", message: "Ticket not found" };
    if (ticket.status === "closed") return { status: "failed", message: "Cannot add note to a closed ticket" };

    ticket.notes.push({ by: userId, byRole: "user", message });
    // If ticket was resolved, reopen it when user replies
    if (ticket.status === "resolved") ticket.status = "in_progress";
    await ticket.save();

    return { status: "success", message: "Note added", data: ticket };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// ========== STAFF SERVICES ==========

// Staff: Get assigned tickets
export const StaffGetTicketsService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { status: filterStatus, page = 1, limit = 20 } = req.query;
    const filter = { assignedTo: userId };
    if (filterStatus && filterStatus !== "all") filter.status = filterStatus;

    const tickets = await Ticket.find(filter)
      .populate("user", "name email phone profileImage")
      .populate("relatedOrder", "orderId totalPayment status")
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await Ticket.countDocuments(filter);
    return {
      status: "success",
      data: { tickets, total, page: parseInt(page, 10), totalPages: Math.ceil(total / limit) },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Staff: Add note + update call review
export const StaffUpdateTicketService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { id } = req.params;
    const { message, status: newStatus, calledUser, callNotes, resolvedByCall } = req.body;

    const ticket = await Ticket.findOne({ _id: id, assignedTo: userId });
    if (!ticket) return { status: "failed", message: "Ticket not found or not assigned to you" };

    if (message) {
      ticket.notes.push({ by: userId, byRole: "staff", message });
    }

    if (calledUser !== undefined) ticket.staffReview.calledUser = calledUser;
    if (callNotes !== undefined) ticket.staffReview.callNotes = callNotes;
    if (resolvedByCall !== undefined) ticket.staffReview.resolvedByCall = resolvedByCall;

    if (newStatus) {
      ticket.status = newStatus;
      if (newStatus === "resolved") ticket.resolvedAt = new Date();
      if (newStatus === "closed") ticket.closedAt = new Date();
    }

    await ticket.save();
    return { status: "success", message: "Ticket updated", data: ticket };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// ========== ADMIN SERVICES ==========

// Admin: Get all tickets with filters
export const AdminGetAllTicketsService = async (req) => {
  try {
    const { status: filterStatus, priority, category, assignedTo, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (filterStatus && filterStatus !== "all") filter.status = filterStatus;
    if (priority && priority !== "all") filter.priority = priority;
    if (category && category !== "all") filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { tokenNumber: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const tickets = await Ticket.find(filter)
      .populate("user", "name email phone profileImage")
      .populate("assignedTo", "name email role")
      .populate("relatedOrder", "orderId totalPayment status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await Ticket.countDocuments(filter);

    // Stats
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const statsMap = {};
    stats.forEach((s) => (statsMap[s._id] = s.count));

    return {
      status: "success",
      data: {
        tickets,
        total,
        page: parseInt(page, 10),
        totalPages: Math.ceil(total / limit),
        stats: {
          open: statsMap.open || 0,
          assigned: statsMap.assigned || 0,
          in_progress: statsMap.in_progress || 0,
          resolved: statsMap.resolved || 0,
          closed: statsMap.closed || 0,
          total,
        },
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Get single ticket detail
export const AdminGetTicketDetailService = async (req) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id)
      .populate("user", "name email phone profileImage role")
      .populate("assignedTo", "name email phone role")
      .populate("relatedOrder", "orderId totalPayment status items")
      .populate("notes.by", "name role profileImage");

    if (!ticket) return { status: "failed", message: "Ticket not found" };
    return { status: "success", data: ticket };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Update ticket (assign, change status, add note, etc.)
export const AdminUpdateTicketService = async (req) => {
  try {
    const adminId = req.headers.user_id;
    const { id } = req.params;
    const { assignedTo, status: newStatus, priority, message } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) return { status: "failed", message: "Ticket not found" };

    if (assignedTo) {
      const staff = await User.findById(assignedTo);
      if (!staff || !["staff", "admin"].includes(staff.role)) {
        return { status: "failed", message: "Can only assign to staff or admin" };
      }
      ticket.assignedTo = assignedTo;
      if (ticket.status === "open") ticket.status = "assigned";
    }

    if (newStatus) {
      ticket.status = newStatus;
      if (newStatus === "resolved") ticket.resolvedAt = new Date();
      if (newStatus === "closed") ticket.closedAt = new Date();
    }

    if (priority) ticket.priority = priority;

    if (message) {
      ticket.notes.push({ by: adminId, byRole: "admin", message });
    }

    await ticket.save();

    // Return populated ticket
    const populated = await Ticket.findById(id)
      .populate("user", "name email phone profileImage role")
      .populate("assignedTo", "name email phone role")
      .populate("relatedOrder", "orderId totalPayment status")
      .populate("notes.by", "name role profileImage");

    return { status: "success", message: "Ticket updated", data: populated };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Delete ticket
export const AdminDeleteTicketService = async (req) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) return { status: "failed", message: "Ticket not found" };
    return { status: "success", message: "Ticket deleted" };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Get staff list for assignment
export const GetStaffForAssignmentService = async (req) => {
  try {
    const staff = await User.find({ role: { $in: ["staff", "admin"] } })
      .select("name email phone role profileImage")
      .sort({ name: 1 });
    return { status: "success", data: staff };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};
