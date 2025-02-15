import type express from "express";
//import logger from "../services/logger.js";

const notFound = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  _: express.NextFunction
) => {
  let statusCode = res.statusCode === 200 ? 400 : res.statusCode;
  let message = err.message;

  // If Mongoose not found error, set to 404 and change message
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }
  // logger.error(`Uncaught Exception: ${err}`);
  res.status(statusCode).json({
    message: message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
