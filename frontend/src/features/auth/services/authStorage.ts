import { Preferences } from "@capacitor/preferences";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const saveSession = async (
  token: string,
  user: any
) => {
  await Preferences.set({
    key: TOKEN_KEY,
    value: token,
  });

  await Preferences.set({
    key: USER_KEY,
    value: JSON.stringify(user),
  });
};

export const getSession = async () => {
  const tokenResult =
    await Preferences.get({
      key: TOKEN_KEY,
    });

  const userResult =
    await Preferences.get({
      key: USER_KEY,
    });

  if (!tokenResult.value) {
    return null;
  }

  return {
    token: tokenResult.value,
    user: userResult.value
      ? JSON.parse(userResult.value)
      : null,
  };
};

export const clearSession = async () => {
  await Preferences.remove({
    key: TOKEN_KEY,
  });

  await Preferences.remove({
    key: USER_KEY,
  });

  // Also clear the old web storage.
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};