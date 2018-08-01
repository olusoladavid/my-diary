import { check } from 'express-validator/check';

const validate = {
  signupInputs: [
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
  loginInputs: [
    check('email')
      .isEmail()
      .withMessage('Your email is invalid'),
    check('password')
      .isString()
      .withMessage('Your password is invalid'),
  ],
  newEntry: [
    check('title')
      .isString()
      .withMessage('Title should be a string'),
    check('content')
      .isString()
      .withMessage('Content should be a string'),
    check('is_favorite')
      .isBoolean()
      .withMessage('isFavorite property of a story should be boolean'),
  ],
};

export default validate;
