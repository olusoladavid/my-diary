import express from 'express';
import { check } from 'express-validator/check';
import userController from '../controllers/userController';
import entryController from '../controllers/entryController';
import verifyToken from '../utils/verifyToken';

const router = express.Router();

/* GET API base */
router.get('/', (req, res) => {
  res.json({ MyDiary: 'API v1' });
});

/* Create a new user */
router.post(
  '/auth/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Your email is invalid'),
    check('password')
      .isString()
      .withMessage('Your password is invalid')
      .isLength({ min: 5 })
      .withMessage('Your password should contain minimum of 5 characters')
      .not()
      .contains(' ')
      .withMessage('Your password contains illegal characters'),
  ],
  userController.createUser,
);

/* Login user */
router.post('/auth/login',
  [
    check('email').isEmail().withMessage('Your email is invalid'),
    check('password').isString().withMessage('Your password is invalid'),
  ],
  userController.loginUser);

/* GET all user entries */
router.get('/entries', verifyToken, entryController.getAllEntries);

export default router;
