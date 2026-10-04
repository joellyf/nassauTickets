import bcrypt from "bcryptjs";
import { pool } from "../src/config/database.js";

const users = [
  {
    id: 1,
    nome: "Atendente Padrão",
    email: "atendente@nassau.com",
    senha: "123456",
    perfil: "ATENDENTE",
  },
  {
    id: 2,
    nome: "Gestor Padrão",
    email: "gestor@nassau.com",
    senha: "123456",
    perfil: "GESTOR",
  },
];

const guiches = [
  { id: 1, identificacao: "01" },
  { id: 2, identificacao: "02" },
  { id: 3, identificacao: "03" },
];

try {
  for (const guiche of guiches) {
    await pool.query(
      `INSERT INTO guiches (id, identificacao, ativo)
       VALUES (?, ?, TRUE)
       ON DUPLICATE KEY UPDATE
         identificacao = VALUES(identificacao),
         ativo = TRUE`,
      [guiche.id, guiche.identificacao],
    );
  }

  for (const user of users) {
    const hash = await bcrypt.hash(user.senha, 12);
    await pool.query(
      `INSERT INTO usuarios (id, nome, email, senha_hash, perfil, ativo)
       VALUES (?, ?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE
         nome = VALUES(nome),
         senha_hash = VALUES(senha_hash),
         perfil = VALUES(perfil),
         ativo = TRUE`,
      [user.id, user.nome, user.email, hash, user.perfil],
    );
  }
  console.log("Base de dados de demonstração preparada.");
} finally {
  await pool.end();
}
