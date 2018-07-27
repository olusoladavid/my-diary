import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index';

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config({ silent: process.env.NODE_ENV === 'production' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());
app.use('/api/v1', router);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

export default app;
