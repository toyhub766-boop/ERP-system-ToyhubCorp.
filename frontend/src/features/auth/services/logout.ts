import { clearSession } from "./authStorage";

export const logoutUser = async () => {
  await clearSession();
};