import jwt from "jsonwebtoken";

export const generateToken = (id, type = "user") => {
  // Admin tokens expire in 12 hours, user/tutor tokens in 48 hours
  const expiresIn = type === "admin" ? "12h" : "48h";

  return jwt.sign({ id, type }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || expiresIn,
  });
};
