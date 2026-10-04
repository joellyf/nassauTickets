export function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Endpoint não encontrado.",
    path: req.originalUrl,
  });
}

export function errorHandler(err, req, res, next) {
  const status = err.status ?? 500;

  if (status >= 500) {
    req.log?.error({ err }, "Erro interno");
  }

  res.status(status).json({
    error: status >= 500 ? "Erro interno do servidor." : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
}
