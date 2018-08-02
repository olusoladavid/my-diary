import express from 'express';
import userController from '../controllers/userController';
import entryController from '../controllers/entryController';
import verifyToken from '../utils/verifyToken';
import validate from '../utils/validate';

const router = express.Router();

/* GET API base */
router.get('/', (req, res) => {
  res.json({ MyDiary: 'API v1' });
});

/* Create a new user */
router.post('/auth/signup', validate.signupInputs, userController.createUser);

/* Login user */
router.post('/auth/login', validate.loginInputs, userController.loginUser);

/* GET all user entries */
router.get('/entries', verifyToken, entryController.getAllEntries);

/* POST a new entry */
router.post('/entries', verifyToken, validate.newEntry, entryController.addEntry);

/* GET a single entry */
router.get('/entries/:id', verifyToken, entryController.getEntry);

/* PUT new data in existing entry */
router.put('/entries/:id', verifyToken, validate.modifyEntry, entryController.modifyEntry);

/* DELETE a single entry */
router.delete('/entries/:id', verifyToken, entryController.deleteEntry);


export default router;
