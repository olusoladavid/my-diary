import pg from 'pg';

const deleteEntry = (req, res) => {
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
    client.query(`DELETE FROM entries 
    USING users 
    WHERE entries.user_id=users.id 
    AND users.email='user@gmail.com' 
    AND entries.id=${req.params.id}`, (queryError, result) => {
      done(); // closing the connection;
      if (queryError) {
        console.log(queryError);
        return res.status(500).send(queryError);
      }
      if (!result.rowCount) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.status(204).json();
    });
  });
};

export default deleteEntry;
