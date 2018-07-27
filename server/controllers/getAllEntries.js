import pg from 'pg';

const getAllEntries = (req, res) => {
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
    client.query(`SELECT entries.id, entries.title, entries.content, entries.created_on, entries.is_favorite, 
    entries.is_public FROM entries 
    INNER JOIN users 
    ON entries.user_id = users.id 
    WHERE users.email='user@gmail.com'`, (queryError, result) => {
      done(); // closing the connection;
      if (queryError) {
        console.log(queryError);
        res.status(400).send(queryError);
      }
      res.status(200).send(result.rows);
    });
  });
};

export default getAllEntries;
