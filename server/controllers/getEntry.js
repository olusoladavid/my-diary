import pg from 'pg';

const getEntry = (req, res) => {
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
      res.status(500).send(err);
    }
    client.query(
      `SELECT entries.id, entries.title, entries.content, entries.created_on, entries.is_favorite, 
    entries.is_public FROM entries 
    INNER JOIN users 
    ON entries.user_id = users.id 
    WHERE users.email='user@gmail.com' AND entries.id=${req.params.id}`,
      (queryError, result) => {
        done(); // closing the connection;
        if (queryError) {
          console.log(queryError);
          return res.status(500).send(queryError);
        }
        if (!result.rowCount) {
          return res.status(404).json({ message: 'Not found' });
        }
        return res.status(200).json(result.rows);
      },
    );
  });
};
export default getEntry;
