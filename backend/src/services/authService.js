import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import { env } from "../config/env.js";
import { unauthorized } from "../utils/httpError.js";
import * as userModel from "../models/userModel.js";

export async function login(email, senha) {
  const connection = await pool.getConnection();
  try {
    const user = await userModel.findByEmail(connection, email);
    if (!user || !user.ativo || !(await bcrypt.compare(senha, user.senha_hash))) {
      throw unauthorized("E-mail ou senha inválidos.");
    }

    const token = jwt.sign(
      { sub: user.id, nome: user.nome, perfil: user.perfil },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn },
    );

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      },
    };
  } finally {
    connection.release();
  }
}

export async function listUsers() {
  const connection = await pool.getConnection();
  try {
    return await userModel.list(connection);
  } finally {
    connection.release();
  }
}

export async function createUser(data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const hash = await bcrypt.hash(data.senha, 12);
    const user = await userModel.create(connection, {
      ...data,
      senhaHash: hash,
    });
    await connection.commit();
    return user;
  } catch (err) {
    await connection.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      err.status = 400;
      err.message = "E-mail já cadastrado.";
    }
    throw err;
  } finally {
    connection.release();
  }
}
