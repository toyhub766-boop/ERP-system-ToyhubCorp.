import axios from "axios";

const API_URL =
  "http://localhost:5000/api/auth";

export const loginUser = async (
  employeeId: string,
  password: string
) => {
  const response = await axios.post(
    `${API_URL}/login`,
    {
      employeeId,
      password,
    }
  );

  return response.data;
};