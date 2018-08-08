import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyToken = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      res
        .status(401)
        .json({ error: { message: 'Authorization failed. Please provide a token' } });
      return;
    }
    const token = req.headers.authorization.split(' ')[1];
    const authorizedUser = jwt.verify(token, process.env.SECRET_KEY);
    req.authorizedUser = authorizedUser;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ error: { message: 'Authorization failed. Your token is invalid or expired' } });
  }
};

export default verifyToken;
