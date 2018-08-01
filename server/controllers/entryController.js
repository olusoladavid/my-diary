import { validationResult } from 'express-validator/check';
import { query } from '../db/index';

class entryController {
  /**
   * Get all of a user's diary entries
   * Requires auth token to be passed in authorization header
   * @static
   * @param {*} req - Client request object
   * @param {*} res - Server response object
   * @returns {object} token
   * @memberof userController
   */
  static getAllEntries(req, res) {
    query(
      `SELECT entries.id, entries.title, entries.content, entries.created_on, entries.updated_on, 
        entries.is_favorite FROM entries INNER JOIN users ON entries.user_id=users.id WHERE users.email=$1`,
      [req.authorizedUser.email],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: { message: 'An error occurred on the server' } });
        }
        return res.status(200).json(result.rows);
      },
    );
  }

  static addEntry(req, res) {
    // validate entry fields - 400
    const errorsFound = validationResult(req);
    if (!errorsFound.isEmpty()) {
      return res.status(400).json({ error: { message: errorsFound.array()[0].msg } });
    }

    const entry = {
      title: req.body.title,
      content: req.body.content,
      isFavorite: req.body.is_favorite,
    };
    // add entry to database
    query(
      `INSERT INTO entries (user_id, title, content, is_favorite) 
      VALUES ((SELECT id from users WHERE email=$1), $2, $3, $4) RETURNING id, title, content, is_favorite, created_on`,
      [req.authorizedUser.email, entry.title, entry.content, entry.isFavorite],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: { message: 'An error occurred on the server' } });
        }
        return res.status(201).json(result.rows[0]);
      },
    );
  }
}

export default entryController;
