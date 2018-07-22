import { entries } from '../db/entries';

const getAllEntries = (req, res) => {
  res.status(200).json(entries);
};

export default getAllEntries;
