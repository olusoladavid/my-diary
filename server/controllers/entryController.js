import 'babel-polyfill';
import { query } from '../db/index';
import validate from '../utils/validate';
import queries from '../db/queries';

class entryController {
  /**
   * Get all of a user's diary entries
   * Requires auth token to be passed in authorization header
   * @static
   * @param {*} req - request object
   * @param {*} res - response object
   * @returns {object} json
   * @memberof userController
   */
  static async getAllEntries(req, res, next) {
    try {
      // get query params
      let { limit, page } = req.query;
      const { filter } = req.query;

      limit = limit ? parseInt(limit, 10) : 20;
      page = page ? parseInt(page, 10) : 0;
      const favs = filter && filter === 'favs' ? 't' : 'all';

      // get entries
      const userEntries = await query(queries.getAllEntries,
        [req.authorizedUser.email, favs]);
      const start = limit * page;
      const stop = limit * (page + 1);
      const selectedEntries = userEntries.rows.slice(start, stop);
      res.status(200).json({
        entries: selectedEntries,
        meta: { limit, page, count: userEntries.rows.length },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @description Creates a new entry by a user
   *
   * @static
   * @param {*} req - Request object with title, content, is_favorite properties
   * @param {*} res - Response object
   * @returns {object} json
   * @memberof entryController
   */
  static async addEntry(req, res, next) {
    try {
      const { title, content, is_favorite: isFavorite } = req.body;

      // add entry to database
      const newEntry = await query(queries.insertOneEntry,
        [req.authorizedUser.email, title, content, isFavorite]);
      res.status(201).json(newEntry.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @description Fetches a single user entry by id
   *
   * @static
   * @param {*} req - Request object with param 'id'
   * @param {*} res - Response object
   * @memberof entryController
   */
  static async getEntry(req, res, next) {
    try {
      const entry = await query(queries.getOneEntry, [req.authorizedUser.email, req.params.id]);
      if (!entry.rowCount) {
        res.status(404).json({ error: { message: 'Entry not found' } });
      }
      res.status(200).json(entry.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @description Modifies a previously created entry not later than 24 hours
   *
   * @static
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @returns {obj} json
   * @memberof entryController
   */
  static async modifyEntry(req, res, next) {
    try {
      // deconstruct request body
      let { title, content } = req.body;

      // convert them to null if they are undefined
      title = title || null;
      content = content || null;
      const isFavorite = validate.booleanOrNull(req.body.is_favorite);

      // check if entry exists and is already older than a day
      const entry = await query(queries.getOneEntry,
        [req.authorizedUser.email, req.params.id]);
      if (!entry.rowCount) res.status(404).json({ error: { message: 'Entry not found' } });

      // older than a day?
      if (!validate.isWithinLast24hours(entry.rows[0].created_on)) {
        res.status(403).json({ error: { message: 'Cannot update entry after 24 hours' } });
      } else {
        // add entry to database
        const updatedEntry = await query(queries.updateOneEntry,
          [title, content, isFavorite, req.authorizedUser.email, req.params.id]);
        res.status(200).json(updatedEntry.rows[0]);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * @description Deletes a single user entry by id
   *
   * @static
   * @param {*} req - Request object with param 'id'
   * @param {*} res - Response object
   * @memberof entryController
   */
  static async deleteEntry(req, res, next) {
    try {
      const deleted = await query(queries.deleteOneEntry,
        [req.authorizedUser.email, req.params.id]);
      if (!deleted.rowCount) {
        res.status(404).json({ error: { message: 'Entry not found' } });
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default entryController;
