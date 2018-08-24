import 'babel-polyfill';
import webpush from 'web-push';
import dotenv from 'dotenv';
import { query } from '../db/index';

dotenv.config();

// general config
const pubKey = process.env.PUSH_PUB_KEY;
const privKey = process.env.PUSH_PRIV_KEY;

webpush.setVapidDetails('https://twitter.com/olusola_dev', pubKey, privKey);

// get all users from database
const getAllUsers = async () => {
  const users = await query('SELECT * FROM users');
  return users.rows;
};

// TODO: RAM optimization - get users in batches
const processNotifications = async () => {
  const users = await getAllUsers().catch(() => {
    console.error('Could not connect to database');
  });
  if (users) {
    users.forEach(async (user) => {
      if (user.reminderisset) {
        try {
          const msg = '{ type: reminder }';
          const options = { TTL: 86400 };
          const pushSub = JSON.parse(user.push_sub);
          await webpush.sendNotification(pushSub, msg, options);
        } catch (err) {
          console.error(`Could not send reminder for user: ${user.email}`);
        }
      }
    });
  }
};

processNotifications();

export default processNotifications;
