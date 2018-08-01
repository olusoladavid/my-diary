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
}

export default entryController;
