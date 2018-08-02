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
  isNumber: number => !Number.isNaN(Number(number)),
};

export default validate;
