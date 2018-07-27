import { validationResult } from 'express-validator/check';
import pg from 'pg';

const modifyEntry = (req, res) => {
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
    client.query(`UPDATE entries SET 
    title = '${entry.title}', content = '${entry.content}' 
    FROM users
    WHERE entries.user_id=users.id
    AND users.email='user@gmail.com'
    AND entries.id=${req.params.id}`,
    (queryError, result) => {
      done(); // closing the connection;
      if (queryError) {
        console.log(queryError);
        return res.status(500).json(queryError);
      }
      if (!result.rowCount) {
        return res.status(404).json({ message: 'Not Found' });
      }
      return res.status(200).json(result.rows);
    });
  });
};

export default modifyEntry;
