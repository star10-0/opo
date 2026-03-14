import { loginUser } from "../services/authService.js";

export async function loginHandler(req, res, next) {
  try {
    const data = await loginUser(req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
