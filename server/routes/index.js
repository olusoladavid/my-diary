import express from 'express';
// import Entry from '../models/entry';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.json({ Hello: 'World' });
});

export default router;
