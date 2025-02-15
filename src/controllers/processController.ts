import asyncHandler from "express-async-handler";
import idQueue from "../services/queue.js";

// @desc    Get product by ID or category
// @route   POST /api/process/:idOrCategory
// @access  Private
const addProcessIds = asyncHandler(async (req, res) => {
  const ids: (number | string)[] = req.body.ids;
  // Enqueue each id as a job
  for (const id of ids) {
    await idQueue.add({ id });
  }

  res.status(200).json({ message: "Jobs enqueued", count: ids.length });
});

export { addProcessIds };
