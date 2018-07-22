import { validationResult } from 'express-validator/check';
import { entries } from '../db/entries';

const modifyEntry = (req, res) => {
  const error = validationResult(req);
  const indexOfFound = entries.findIndex(entry => entry.id === Number(req.params.id));

  if (indexOfFound > -1 && error.isEmpty()) {
    const found = Object.assign({}, entries[indexOfFound]);
    entries[indexOfFound] = Object.assign(found, req.body);
    return res.status(200).json(entries[indexOfFound]);
  }
  if (indexOfFound === -1) {
    return res.status(404).json({ errors: [{ msg: 'Entry does not exist' }] });
  }
  return res.status(400).json({ errors: error.array() });
};

export default modifyEntry;
