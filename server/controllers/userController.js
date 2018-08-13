import { validationResult } from 'express-validator/check';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
  static createUser(req, res) {
    // get email and password in request body
    const { email, password } = req.body;

    // validate email and password - 400
    const errorsFound = validationResult(req);
    if (!errorsFound.isEmpty()) {
      res.status(400).json({ error: { message: errorsFound.array() } });
      return;
    }

    // check if email already exists - 409
    query(queries.getOneUser, [email], (qErr, user) => {
      if (qErr) {
        res.status(500).json({ error: { message: 'An error occurred on the server.' } });
        return;
      }
      if (user.rows.length) {
        res.status(409).json({ error: { message: 'User already exists. Please login.' } });
        return;
      }

      // hash the password
      bcrypt.hash(password, 5, (bErr, hash) => {
        if (bErr) {
          res.status(500).json({ error: { message: 'An error occurred on the server.' } });
          return;
        }

        // insert new user into table, returning data
        query(queries.insertOneUser, [email, hash], (qErr2, newUser) => {
          if (qErr2) {
            res.status(500).json({ error: { message: 'An error occurred on the server.' } });
            return;
          }

          // create token using new data and sign with password hash+lastLogin+lastLogout
          const userInfo = newUser.rows[0];
          const data = { email: userInfo.email, createdOn: userInfo.created_on };
          const token = signAuthToken(data);

          // signed token - 201
          res.status(201).json({ token });
        });
      });
    });
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
  static loginUser(req, res) {
    // get email and password in request body
    const { email, password } = req.body;
    // validate email and password - 400
    const errorsFound = validationResult(req);
    if (!errorsFound.isEmpty()) {
      res.status(400).json({ error: { message: errorsFound.array() } });
      return;
    }
    // fetch user
    query(queries.getOneUser, [email], (qErr, userData) => {
      if (qErr) {
        res.status(404).json({ error: { message: 'An error occurred on the server.' } });
        return;
      }
      // if error in fetch, user does not exist - 404
      if (!userData.rows.length) {
        res.status(422).json({ error: { message: 'Email or Password is incorrect' } });
        return;
      }
      // check password
      bcrypt.compare(password, userData.rows[0].password, (bErr, valid) => {
        if (!valid) {
          res.status(422).json({ error: { message: 'Email or Password is incorrect' } });
          return;
        }
        // create token
        const data = {
          email: userData.rows[0].email, createdOn: userData.rows[0].created_on,
        };
        const token = signAuthToken(data);
        // return signed token - 200
        res.status(200).json({ token });
      });
    });
  }

  /**
   * @description Fetches user profile
   *
   * @static
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @memberof userController
   */
  static getProfile(req, res) {
    query(queries.getEntriesCount, [req.authorizedUser.email],
      (err, result) => {
        if (err) {
          res.status(500).json({ error: { message: 'An error occurred on the server' } });
          return;
        }
        res.status(200).json({
          email: req.authorizedUser.email,
          entriesCount: result.rows[0].count,
        });
      });
  }
}

export default userController;
