import { queryClient } from './index';

const usersTableQuery = `CREATE TABLE IF NOT EXISTS users
(
    id SERIAL PRIMARY KEY,
    email VARCHAR (100) UNIQUE  NOT NULL,
    password VARCHAR (255)   NOT NULL,
    created_on TIMESTAMP  DEFAULT now() NOT NULL,
    updated_on TIMESTAMP  DEFAULT now() NOT NULL,
    reminderIsSet BOOLEAN DEFAULT false NOT NULL
);`;

const entriesTableQuery = `CREATE TABLE IF NOT EXISTS entries (
    id  SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    created_on TIMESTAMP  DEFAULT now() NOT NULL,
    updated_on TIMESTAMP  DEFAULT now() NOT NULL,
    title VARCHAR (100)   NOT NULL,
    content VARCHAR (1000)   NOT NULL,
    is_favorite BOOLEAN DEFAULT false NOT NULL
);`;

const createTables = () => queryClient((err, client, done) => {
  if (err) {
    console.log(err.stack);
  } else {
    done();
    client.query(`${usersTableQuery} ${entriesTableQuery}`);
  }
});

export default createTables;
