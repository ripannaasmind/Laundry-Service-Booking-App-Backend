import {
  CreateTicketService, GetMyTicketsService, GetTicketDetailService, AddTicketNoteService,
  StaffGetTicketsService, StaffUpdateTicketService,
  AdminGetAllTicketsService, AdminGetTicketDetailService, AdminUpdateTicketService,
  AdminDeleteTicketService, GetStaffForAssignmentService,
} from "../service/ticket.service.js";

// User
export const CreateTicket = async (req, res) => {
  const result = await CreateTicketService(req);
  res.status(result.status === "success" ? 201 : 400).json(result);
};
export const GetMyTickets = async (req, res) => {
  const result = await GetMyTicketsService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
export const GetTicketDetail = async (req, res) => {
  const result = await GetTicketDetailService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
export const AddTicketNote = async (req, res) => {
  const result = await AddTicketNoteService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

// Staff
export const StaffGetTickets = async (req, res) => {
  const result = await StaffGetTicketsService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
export const StaffUpdateTicket = async (req, res) => {
  const result = await StaffUpdateTicketService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

// Admin
export const AdminGetAllTickets = async (req, res) => {
  const result = await AdminGetAllTicketsService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
export const AdminGetTicketDetail = async (req, res) => {
  const result = await AdminGetTicketDetailService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
export const AdminUpdateTicket = async (req, res) => {
  const result = await AdminUpdateTicketService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
export const AdminDeleteTicket = async (req, res) => {
  const result = await AdminDeleteTicketService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
export const GetStaffForAssignment = async (req, res) => {
  const result = await GetStaffForAssignmentService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
