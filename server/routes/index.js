import express from 'express';
import getAllEntries from '../controllers/getAllEntries';
import getEntry from '../controllers/getEntry';

const router = express.Router();

/* GET API base */
router.get('/', (req, res) => {
  res.json({ MyDiary: 'API v1' });
});

/* GET all user entries */
router.get('/entries', getAllEntries);

/* GET a single entry */
router.get('/entries/:id', getEntry);

export default router;
