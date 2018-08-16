export default class queries {}

queries.getOneUser = 'SELECT * FROM users WHERE email=$1';

queries.insertOneUser = 'INSERT INTO users(email, password) VALUES($1, $2) RETURNING *';

queries.getAllEntries = `SELECT entries.id, entries.title, entries.content, entries.created_on, 
entries.updated_on, entries.is_favorite FROM entries INNER JOIN users ON entries.user_id=users.id 
WHERE (users.email=$1) AND ($2='all' OR entries.is_favorite='t')`;

queries.getOneEntry = `SELECT entries.id, entries.title, entries.content, 
entries.created_on, entries.is_favorite FROM entries INNER JOIN users ON entries.user_id = users.id 
WHERE users.email=$1 AND entries.id=$2`;

queries.insertOneEntry = `INSERT INTO entries (user_id, title, content, is_favorite) 
VALUES ((SELECT id from users WHERE email=$1), $2, $3, $4) 
RETURNING id, title, content, is_favorite, created_on`;

queries.updateOneEntry = `UPDATE entries SET title = COALESCE($1, title), 
content = COALESCE($2, content),is_favorite = COALESCE($3, is_favorite) 
FROM users WHERE entries.user_id=users.id AND users.email=$4
AND entries.id=$5 RETURNING entries.id, entries.title, 
entries.content, entries.is_favorite, entries.created_on`;

queries.deleteOneEntry = `DELETE FROM entries USING users 
WHERE entries.user_id=users.id AND users.email=$1 AND entries.id=$2`;

queries.updateProfile = `UPDATE users SET push_sub = COALESCE($2, push_sub), 
reminderisset = COALESCE($3, reminderisset) WHERE email=$1 
RETURNING push_sub, reminderisset`;
