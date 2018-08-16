import { body, query, param } from 'express-validator/check';

class validate {
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
  body('email')
    .isEmail()
    .withMessage('Your email is invalid')
    .not()
    .isEmpty()
    .withMessage('Your email should not be empty'),
  body('password')
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
  body('email')
    .isEmail()
    .withMessage('Your email is invalid')
    .not()
    .isEmpty()
    .withMessage('Your email should not be empty'),
  body('password')
    .isString()
    .withMessage('Your password is invalid')
    .not()
    .isEmpty()
    .withMessage('Your password should not be empty'),
];

validate.newEntry = [
  body('title')
    .isString()
    .withMessage('Title should be a string')
    .not()
    .isEmpty()
    .withMessage('Title should not be empty'),
  body('content')
    .isString()
    .withMessage('Content should be a string')
    .not()
    .isEmpty()
    .withMessage('Content should not be empty'),
  body('is_favorite')
    .isBoolean()
    .withMessage('Entry should either be favorited or not (boolean)'),
];

validate.modifyEntry = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('Entry id should be an integer greater than zero'),
  body('title')
    .isString()
    .withMessage('Title should be a string')
    .not()
    .isEmpty()
    .withMessage('Title should not be empty')
    .optional(),
  body('content')
    .isString()
    .withMessage('Content should be a string')
    .not()
    .isEmpty()
    .withMessage('Content should not be empty')
    .optional(),
  body('is_favorite')
    .isBoolean()
    .withMessage('Entry should either be favorited or not (boolean)')
    .optional(),
];

validate.updateProfile = [
  body('push_sub')
    .isJSON()
    .withMessage('Push Subscription should be JSON')
    .optional(),
  body('email_reminder')
    .isBoolean()
    .withMessage('Email reminder preference should be boolean')
    .optional(),
];

validate.getEntries = [
  query('limit')
    .isInt({ gt: 0 })
    .withMessage('Limit parameter should be an integer greater than zero')
    .optional(),
  query('page')
    .isInt({ gt: -1 })
    .withMessage('Page parameter should be integer')
    .optional(),
  query('filter')
    .isString()
    .withMessage('Filter parameter should be a string')
    .not()
    .isEmpty()
    .withMessage('Filter parameter should not be empty')
    .isIn(['favs'])
    .withMessage('Filter paramter value is invalid')
    .optional(),
];

validate.getEntry = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('Entry id should be an integer greater than zero'),
];

validate.deleteEntry = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('Entry id should be an integer greater than zero'),
];


export default validate;
