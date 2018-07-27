import { validationResult } from 'express-validator/check';
import pg from 'pg';

const addEntry = (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }
  const entry = {
    title: req.body.title,
    content: req.body.content,
    isFavorite: req.body.isFavorite,
    isPublic: req.body.isPublic,
  };
  const config = {
    user: 'postgres',
    database: 'mydiary',
    password: 'postgres',
    port: 5432,
  };
  const pool = new pg.Pool(config);
  pool.connect((err, client, done) => {
    if (err) {
      console.log(`not able to get connection ${err}`);
      return res.status(500).send(err);
    }
    client.query(`INSERT INTO entries (user_id, title, content, is_favorite, is_public) 
    VALUES ((SELECT id from users WHERE email='user@gmail.com'), '${entry.title}', '${entry.content}', 
    ${entry.isFavorite}, ${entry.isPublic})`,
    (queryError, result) => {
      done(); // closing the connection;
      if (queryError) {
        console.log(queryError);
        return res.status(500).json(queryError);
      }
      return res.status(201).json(result.rows);
    });
  });
};

export default addEntry;
