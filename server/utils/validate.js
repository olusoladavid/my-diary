import { check } from 'express-validator/check';

class validate {
  static isNumber(number) {
    return !Number.isNaN(Number(number));
  }

  static booleanOrNull(bool) {
    return (typeof bool === 'undefined' ? null : bool);
  }

  static isWithinLast24hours(dateString) {
    const dateMilli = new Date(dateString).getTime();
    const hoursSinceCreated = (Date.now() - dateMilli) / (1000 * 60 * 60);
    if (hoursSinceCreated > 24) return false;
    return true;
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
    .withMessage('Entry should either be favorited or not (boolean)'),
];

validate.modifyEntry = [
  check('title')
    .isString()
    .withMessage('Title should be a string')
    .not()
    .isEmpty()
    .withMessage('Title should not be empty')
    .optional(),
  check('content')
    .isString()
    .withMessage('Content should be a string')
    .not()
    .isEmpty()
    .withMessage('Content should not be empty')
    .optional(),
  check('is_favorite')
    .isBoolean()
    .withMessage('Entry should either be favorited or not (boolean)')
    .optional(),
];


export default validate;
