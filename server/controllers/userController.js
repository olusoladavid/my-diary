import { validationResult } from 'express-validator/check';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/index';


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
      return res.status(400).json({ error: { message: errorsFound.array()[0].msg } });
    }

    // check if email already exists - 409
    query('SELECT * FROM users WHERE email=$1', [email], (qErr, user) => {
      if (qErr) {
        return res.status(500).json({ error: { message: 'An error occurred on the server.' } });
      }
      if (user.rows.length) {
        return res.status(409).json({ error: { message: 'User already exists. Please login.' } });
      }

      // hash the password
      bcrypt.hash(password, 5, (bErr, hash) => {
        if (bErr) {
          return res.status(500).json({ error: { message: 'An error occurred on the server.' } });
        }

        // insert new user into table, returning data
        query('INSERT INTO users(email, password) VALUES($1, $2) RETURNING *', [email, hash], (qErr2, newUser) => {
          if (qErr2) {
            return res.status(500).json({ error: { message: 'An error occurred on the server.' } });
          }

          // create token using new data and sign with password hash+lastLogin+lastLogout
          const userInfo = newUser.rows[0];
          const jwtSecret = process.env.SECRET_KEY;
          const data = { email: userInfo.email, createdOn: userInfo.created_on };
          const token = jwt.sign(data, jwtSecret, { expiresIn: '2h' });

          // return signed token - 201
          return res.status(201).json({ token });
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
      return res.status(400).json({ error: { message: errorsFound.array()[0].msg } });
    }
    // fetch user
    query('SELECT * FROM users WHERE email=$1', [email], (qErr, userData) => {
      if (qErr) {
        return res.status(404).json({ error: { message: 'An error occurred on the server.' } });
      }
      // if error in fetch, user does not exist - 404
      if (!userData.rows.length) return res.status(404).json({ error: { message: 'User does not exist' } });
      // check password
      bcrypt.compare(password, userData.rows[0].password, (bErr, valid) => {
        if (!valid) {
          return res.status(422).json({ error: { message: 'Email or Password is incorrect' } });
        }
        // create token
        const jwtSecret = process.env.SECRET_KEY;
        const token = jwt.sign({
          email: userData.rows[0].email, createdOn: userData.rows[0].created_on,
        }, jwtSecret);
        // return signed token - 200
        return res.status(200).json({ token });
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
    query(
      `SELECT COUNT(*) FROM entries 
    INNER JOIN users 
    ON entries.user_id = users.id 
    WHERE users.email=$1`, [req.authorizedUser.email],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: { message: 'An error occurred on the server' } });
        }
        console.log(result.rows);
        return res.status(200).json({ email: req.authorizedUser.email, entriesCount: result.rows[0].count });
      },
    );
  }
}

export default userController;
