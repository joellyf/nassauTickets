import { pingDatabase } from "../config/database.js";

export async function health(req, res) {
  await pingDatabase();
  res.status(200).json({
    status: "ok",
    message: "nassauTickets API e MySQL operacionais.",
  });
}
