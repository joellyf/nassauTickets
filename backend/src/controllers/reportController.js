import * as reportService from "../services/reportService.js";

export async function report(req, res) {
  res.status(200).json(await reportService.getReport(req.validated.query));
}
