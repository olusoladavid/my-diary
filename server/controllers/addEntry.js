import { validationResult } from 'express-validator/check';
import entries from '../db/entries';

const addEntry = (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }
  const entry = req.body;
  entry.id = entries.length + 1;
  entries.push(entry);
  return res.status(201).json(entry);
};

export default addEntry;
