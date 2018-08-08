import { check } from 'express-validator/check';

class validate {
  static isNumber(number) {
    return !Number.isNaN(Number(number));
  }

  static booleanOrNull(bool) {
    return (typeof bool === 'undefined' ? null : bool);
  }
}

validate.signupInputs = [
  check('email')
    .isEmail()
    .withMessage('Your email is invalid')
    .not()
    .isEmpty()
    .withMessage('Your email should not be empty'),
  check('password')
    .not()
    .isEmpty()
    .withMessage('Your password should not be empty')
    .isString()
    .withMessage('Your password is invalid')
    .isLength({ min: 5 })
    .withMessage('Your password should contain minimum of 5 characters')
    .not()
    .contains(' ')
    .withMessage('Your password contains illegal characters'),
];

validate.loginInputs = [
  check('email')
    .isEmail()
    .withMessage('Your email is invalid')
    .not()
    .isEmpty()
    .withMessage('Your email should not be empty'),
  check('password')
    .isString()
    .withMessage('Your password is invalid')
    .not()
    .isEmpty()
    .withMessage('Your password should not be empty'),
];

validate.newEntry = [
  check('title')
    .isString()
    .withMessage('Title should be a string')
    .not()
    .isEmpty()
    .withMessage('Title should not be empty'),
  check('content')
    .isString()
    .withMessage('Content should be a string')
    .not()
    .isEmpty()
    .withMessage('Content should not be empty'),
  check('is_favorite')
    .isBoolean()
    .withMessage('Story should either be favorited or not'),
];

validate.modifyEntry = [
  check('title')
    .isString()
    .optional(),
  check('content')
    .isString()
    .optional(),
  check('is_favorite')
    .isBoolean()
    .optional(),
];


export default validate;
