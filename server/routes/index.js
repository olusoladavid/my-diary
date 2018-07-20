import express from 'express';
import { check } from 'express-validator/check';
import getAllEntries from '../controllers/getAllEntries';
import getEntry from '../controllers/getEntry';
import addEntry from '../controllers/addEntry';

const router = express.Router();

/* GET API base */
router.get('/', (req, res) => {
  res.json({ MyDiary: 'API v1' });
});

/* GET all user entries */
router.get('/entries', getAllEntries);

/* GET a single entry */
router.get('/entries/:id', getEntry);

/* POST a new entry */
router.post(
  '/entries',
  [check('timestamp').isInt(), check('title').isString(), check('content').isString()],
  addEntry,
);

export default router;
