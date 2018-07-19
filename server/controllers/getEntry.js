import entries from '../db/entries';

const getEntry = (req, res) => {
  const found = entries.find(entry => entry.id === Number(req.params.id));
  if (found) {
    res.status(200).json(found);
  } else {
    res.status(404).json({ error: 'Entry does not exist.' });
  }
};

export default getEntry;
