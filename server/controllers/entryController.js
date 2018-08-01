import { validationResult } from 'express-validator/check';
import { query } from '../db/index';
import validate from '../utils/validate';

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
    let { limit, page } = req.query;
    // validate queries
    limit = validate.isNumber(limit) ? limit : 20;
    page = validate.isNumber(page) ? page : 0;
    // get entries
    query(
      `SELECT entries.id, entries.title, entries.content, entries.created_on, entries.updated_on, 
        entries.is_favorite FROM entries INNER JOIN users ON entries.user_id=users.id WHERE users.email=$1 
        LIMIT $2 OFFSET $3`,
      [req.authorizedUser.email, limit, page * limit],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: { message: 'An error occurred on the server' } });
        }
        return res.status(200).json({ entries: result.rows, meta: { limit, page } });
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

  static getEntry(req, res) {
    query(
      `SELECT entries.id, entries.title, entries.content, entries.created_on, entries.is_favorite FROM entries 
    INNER JOIN users 
    ON entries.user_id = users.id 
    WHERE users.email=$1 AND entries.id=$2`, [req.authorizedUser.email, req.params.id],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: { message: 'An error occurred on the server' } });
        }
        if (!result.rowCount) {
          return res.status(404).json({ error: { message: 'Entry not found' } });
        }
        return res.status(200).json(result.rows[0]);
      },
    );
  }
}

export default entryController;
