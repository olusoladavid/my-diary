import express from 'express';
import { check } from 'express-validator/check';
import getAllEntries from '../controllers/getAllEntries';
import getEntry from '../controllers/getEntry';
import addEntry from '../controllers/addEntry';
import modifyEntry from '../controllers/modifyEntry';

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
  [
    check('timestamp').isInt(),
    check('title').isString(),
    check('content').isString(),
    check('isFavorite').isBoolean(),
  ],
  addEntry,
);

/* PUT new data in existing entry */
router.put(
  '/entries/:id',
  [
    check('timestamp')
      .not()
      .exists()
      .withMessage('Timestamp cannot be modified'),
    check('title')
      .isString()
      .optional(),
    check('content')
      .isString()
      .optional(),
    check('isFavorite')
      .isBoolean()
      .optional(),
  ],
  modifyEntry,
);

export default router;
