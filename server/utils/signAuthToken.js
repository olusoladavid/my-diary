import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const signAuthToken = (data) => {
  const jwtSecret = process.env.SECRET_KEY;
  const options = { expiresIn: '2h' };
  return jwt.sign(data, jwtSecret, options);
};

export default signAuthToken;
