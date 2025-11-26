export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = "GNOSIS AI";

// Logo da GNOSIS AI
export const APP_LOGO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663169314957/eRLFubileexzOKHZ.png";

// Clerk handles authentication, no need for custom login URL
export const getLoginUrl = () => {
  return "/sign-in";
};

