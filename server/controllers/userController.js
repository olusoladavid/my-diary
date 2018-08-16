import 'babel-polyfill';
import bcrypt from 'bcrypt';
import { query } from '../db/index';
import queries from '../db/queries';
import signAuthToken from '../utils/signAuthToken';

class userController {
  /**
   * Creates a new user account
   * Requires email and password to be passed in request body
   * @static
   * @param {*} req - Client request object
   * @param {*} res - Server response object
   * @returns {object} token
   * @memberof userController
   */
  static async createUser(req, res, next) {
    try {
      // get email and password in request body
      const { email, password } = req.body;

      // check if user already exists - 409
      const user = await query(queries.getOneUser, [email]);
      if (user.rows.length) {
        res.status(409).json({ error: { message: 'User already exists. Please login.' } });
      }

      // hash the password
      const passwordHash = await bcrypt.hash(password, 5);

      // insert new user into table, returning data
      const newUser = await query(queries.insertOneUser, [email, passwordHash]);

      // create token using new data
      const userInfo = newUser.rows[0];
      const data = { email: userInfo.email, createdOn: userInfo.created_on };
      const token = signAuthToken(data);

      // signed token - 201
      res.status(201).json({ token });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logs in an existing user
   * Requires email and password to be passed in request body
   * @static
   * @param {*} req - Client request object
   * @param {*} res - Server response object
   * @returns {token}
   * @memberof userController
   */
  static async loginUser(req, res, next) {
    try {
      // get email and password in request body
      const { email, password } = req.body;

      // fetch user
      const user = await query(queries.getOneUser, [email]);

      // if error in fetch, user does not exist - 422
      if (!user.rows.length) {
        res.status(422).json({ error: { message: 'Email or Password is incorrect' } });
      }

      // check password
      const passwordIsValid = await bcrypt.compare(password, user.rows[0].password);
      if (!passwordIsValid) {
        res.status(422).json({ error: { message: 'Email or Password is incorrect' } });
        return;
      }

      // create token
      const data = {
        email: user.rows[0].email, createdOn: user.rows[0].created_on,
      };
      const token = signAuthToken(data);
      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @description Fetches user profile
   * Returns user profile information
   * @static
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @returns {data} email, entriesCount
   * @memberof userController
   */
  static async getProfile(req, res, next) {
    try {
      const allEntries = await query(queries.getAllEntries, [req.authorizedUser.email, 'all']);
      const favEntries = await query(queries.getAllEntries, [req.authorizedUser.email, 't']);
      const user = await query(queries.getOneUser, [req.authorizedUser.email]);
      res.status(200).json({
        email: req.authorizedUser.email,
        entries_count: allEntries.rows.length,
        fav_count: favEntries.rows.length,
        created_on: user.rows[0].created_on,
        push_sub: JSON.parse(user.rows[0].push_sub),
        email_reminder: user.rows[0].reminderisset,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { push_sub: pushSub, email_reminder: reminderIsSet } = req.body;
      const pushSubString = JSON.stringify(pushSub);
      await query(queries.updateProfile, [req.authorizedUser.email,
        pushSubString, reminderIsSet]);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default userController;
