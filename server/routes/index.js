import express from 'express';
import userController from '../controllers/userController';
import entryController from '../controllers/entryController';
import verifyToken from '../utils/verifyToken';
import validate from '../utils/validate';
import handleValidationErrors from '../utils/handleValidationErrors';

const router = express.Router();

/* GET API base */
router.get('/', (req, res) => {
  res.json({ MyDiary: 'API v1' });
});

/* Create a new user */
router.post(
  '/auth/signup',
  validate.signupInputs,
  handleValidationErrors,
  userController.createUser,
);

/* Login user */
router.post('/auth/login', validate.loginInputs, handleValidationErrors, userController.loginUser);

/* GET all user entries */
router.get('/entries', verifyToken, validate.getEntries, handleValidationErrors, entryController.getAllEntries);

/* POST a new entry */
router.post(
  '/entries',
  verifyToken,
  validate.newEntry,
  handleValidationErrors,
  entryController.addEntry,
);

/* GET a single entry */
router.get('/entries/:id', verifyToken, validate.getEntry, handleValidationErrors, entryController.getEntry);

/* PUT new data in existing entry */
router.put(
  '/entries/:id',
  verifyToken,
  validate.modifyEntry,
  handleValidationErrors,
  entryController.modifyEntry,
);

/* DELETE a single entry */
router.delete('/entries/:id', verifyToken, validate.deleteEntry, handleValidationErrors, entryController.deleteEntry);

/* GET user profile */
router.get('/profile', verifyToken, userController.getProfile);

/* PUT user profile */
router.put(
  '/profile',
  verifyToken,
  validate.updateProfile,
  handleValidationErrors,
  userController.updateProfile,
);

export default router;
