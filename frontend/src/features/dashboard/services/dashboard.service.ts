import axios from "../../../services/api/axios";

export const getProducts = async () => {
  const res = await axios.get("/products");
  return res.data;
};

export const getInventoryTransactions = async () => {
  const res = await axios.get("/inventory/transactions");
  return res.data;
};

export const getProduction = async () => {
  const res = await axios.get("/production");
  return res.data;
};

export const getDispatch = async () => {
  const res = await axios.get("/dispatch");
  return res.data;
};

export const getAttendance = async () => {
  const res = await axios.get("/attendance");
  return res.data;
};

export const getCustomers = async () => {
  const res = await axios.get("/customers");
  return res.data;
};

export const getOrders = async () => {
  const res = await axios.get("/orders");
  return res.data;
};