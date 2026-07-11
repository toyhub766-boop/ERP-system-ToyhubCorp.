import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

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