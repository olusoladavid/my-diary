import { entries } from '../db/entries';

const deleteEntry = (req, res) => {
  const indexOfFound = entries.findIndex(entry => entry.id === Number(req.params.id));
  if (indexOfFound > -1) {
    entries.splice(indexOfFound, 1);
    res.status(204).json();
  } else {
    res.status(404).json({ errors: [{ msg: 'Entry does not exist' }] });
  }
};

export default deleteEntry;
