import * as ticketService from "../services/ticketService.js";

export async function issue(req, res) {
  const ticket = await ticketService.issue(req.validated.body.tipo);
  res.status(201).json(ticket);
}

export async function callNext(req, res) {
  const ticket = await ticketService.callNext({
    guicheId: req.validated.body.guiche_id,
    atendenteId: req.user?.sub ?? req.demoAttendantId ?? req.validated.body.atendente_id,
  });
  res.status(200).json(ticket);
}

export async function status(req, res) {
  const ticket = await ticketService.act(
    Number(req.validated.params.id),
    req.validated.body.acao,
    req.user?.sub ?? req.demoAttendantId ?? req.validated.body.atendente_id,
  );
  res.status(200).json(ticket);
}

export async function panel(req, res) {
  res.status(200).json({ calls: await ticketService.getPanel() });
}

export async function snapshot(req, res) {
  res.status(200).json(await ticketService.getSnapshot());
}

export async function close(req, res) {
  res.status(200).json(await ticketService.closeUnstarted());
}
