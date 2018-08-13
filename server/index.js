import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import router from './routes/index';
import createTables from './db/createTables';

// create database tables if they are not existing yet
createTables();

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config({ silent: process.env.NODE_ENV === 'production' });

const docs = YAML.load(path.join(process.cwd(), './server/docs.yaml'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());
app.use('/api/v1', router);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(docs));
app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
  } else {
    res.status(500).json({ error: { message: 'An error occurred on the server' } });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

export default app;
