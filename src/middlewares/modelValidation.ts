import Joi from "joi";
import asyncHandler from "express-async-handler";
//TODO

const idsValidation = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    ids: Joi.array()
      .items(Joi.string().regex(/^[0-9a-zA-Z]{6,15}$/))
      .required(),
  });
  await schema.validateAsync(req.body);
  next();
});

export { idsValidation };
