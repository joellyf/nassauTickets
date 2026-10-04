import * as authService from "../services/authService.js";

export async function login(req, res) {
  const result = await authService.login(req.validated.body.email, req.validated.body.senha);
  res.status(200).json(result);
}

export async function me(req, res) {
  res.status(200).json({ user: req.user });
}

export async function listUsers(req, res) {
  res.status(200).json({ users: await authService.listUsers() });
}

export async function createUser(req, res) {
  const user = await authService.createUser(req.validated.body);
  res.status(201).json({ user });
}
