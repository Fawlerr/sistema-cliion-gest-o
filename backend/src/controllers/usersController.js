import { listUsers, getUserById } from "../services/usersService.js";
import { parseIdParam } from "../lib/validators.js";

export async function getUsers(_req, res) {
  const users = await listUsers();
  res.json({ data: users, meta: { count: users.length } });
}

export async function getUser(req, res) {
  const userId = parseIdParam(req.params.id, "user id");
  const user = await getUserById(userId);
  res.json({ data: user });
}
