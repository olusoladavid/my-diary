import { validationResult } from 'express-validator/check';
import { query } from '../db/index';
import validate from '../utils/validate';
import queries from '../db/queries';

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
      queries.getAllEntries,
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

  /**
   * @description Creates a new entry by a user
   *
   * @static
   * @param {*} req - Request object with title, content, is_favorite properties
   * @param {*} res - Response object
   * @returns {object} response
   * @memberof entryController
   */
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
      queries.insertOneEntry,
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

  /**
   * @description Fetches a single user entry by id
   *
   * @static
   * @param {*} req - Request object with param 'id'
   * @param {*} res - Response object
   * @memberof entryController
   */
  static getEntry(req, res) {
    query(
      queries.getOneEntry, [req.authorizedUser.email, req.params.id],
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

  /**
   * @description Modifies a previously created entry not later than 24 hours
   *
   * @static
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @returns {obj} response
   * @memberof entryController
   */
  static modifyEntry(req, res) {
    // validate entry fields - 400
    const errorsFound = validationResult(req);
    if (!errorsFound.isEmpty()) {
      return res.status(400).json({ error: { message: errorsFound.array()[0].msg } });
    }

    // deconstruct request body
    let { title, content } = req.body;
    title = title || null;
    content = content || null;
    // check if isFavorite is defined
    const isFavorite = validate.booleanOrNull(req.body.is_favorite);

    // check if entry is already older than a day
    query(
      queries.getEntryCreationDate, [req.authorizedUser.email, req.params.id],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: { message: 'An error occurred on the server' } });
        }
        if (!result.rowCount) {
          return res.status(404).json({ error: { message: 'Entry not found' } });
        }
        const createdOn = new Date(result.rows[0].created_on).getTime();
        const hoursSinceCreated = (Date.now() - createdOn) / (1000 * 60 * 60);
        if (hoursSinceCreated > 24) {
          return res.status(403).json({
            error: { message: 'Cannot update entry after 24 hours' },
          });
        }
      },
    );
    // add entry to database
    query(
      queries.updateOneEntry,
      [title, content, isFavorite, req.authorizedUser.email, req.params.id],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: { message: 'An error occurred on the server' } });
        }
        return res.status(200).json(result.rows[0]);
      },
    );
  }

  /**
   * @description Deletes a single user entry by id
   *
   * @static
   * @param {*} req - Request object with param 'id'
   * @param {*} res - Response object
   * @memberof entryController
   */
  static deleteEntry(req, res) {
    query(
      queries.deleteOneEntry, [req.authorizedUser.email, req.params.id],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: { message: 'An error occurred on the server' } });
        }
        if (!result.rowCount) {
          return res.status(404).json({ error: { message: 'Entry not found' } });
        }
        return res.status(204).json();
      },
    );
  }
}

export default entryController;
