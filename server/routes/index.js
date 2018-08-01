import express from 'express';
import userController from '../controllers/userController';
import validate from '../utils/validate';

const router = express.Router();

/* GET API base */
router.get('/', (req, res) => {
  res.json({ MyDiary: 'API v1' });
});

/* Create a new user */
router.post('/auth/signup', validate.signupInputs, userController.createUser);

export default router;
