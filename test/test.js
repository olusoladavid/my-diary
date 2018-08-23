import chai from 'chai';
import chaiHttp from 'chai-http';
import { before } from 'mocha';
import sinon from 'sinon';
import webpush from 'web-push';
import app from '../server/index';
import sampleData from './sampleData';
import { pool, query } from '../server/db/index';
import createTables from '../server/db/createTables';
import processNotifications from '../server/workers/sendReminder';

const { expect } = chai;
chai.use(chaiHttp);

let token; // for caching token for further requests
let cachedEntry; // for caching retrieved entry for later comparison
let clock; // for manipulating datetime stub
let entryCreationDate; // for storing pg date of cached entry

const makeAuthHeader = authToken => `Bearer ${authToken}`;

before(async () => {
  // try to create tables if they dont exist
  await createTables();
  // remove all entries
  const task1 = await query('TRUNCATE TABLE entries CASCADE');
  // remove all users
  const task2 = await query('TRUNCATE TABLE users CASCADE');
  // reset entries id column sequence
  if (task1.rows && task2.rows) await query('ALTER SEQUENCE entries_id_seq RESTART WITH 1');
});

after(() => {
  clock.restore();
});

describe('/GET API base', () => {
  it('should return 200 to confirm that the API server is running', (done) => {
    chai
      .request(app)
      .get('/api/v1')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe('/POST /auth/signup', () => {
  it('should return 201 with an auth token when a new user is successfully created', (done) => {
    chai
      .request(app)
      .post('/api/v1/auth/signup')
      .send(sampleData.validUser)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('token');
        ({ token } = res.body.token);
        done();
      });
  });

  it('should return 409 conflict error without an auth token when a user is already signed up', (done) => {
    chai
      .request(app)
      .post('/api/v1/auth/signup')
      .send(sampleData.validUser)
      .end((err, res) => {
        expect(res).to.have.status(409);
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.have.property('token');
        expect(res.body).to.have.property('error');
        done();
      });
  });

  it('should return 400 bad request error when a user tries to sign up with invalid details', (done) => {
    chai
      .request(app)
      .post('/api/v1/auth/signup')
      .send(sampleData.invalidUser)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        done();
      });
  });
});

describe('/POST /auth/login', () => {
  it('should return 200 with an auth token when user successfully logs in', (done) => {
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send(sampleData.validUser)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('token');
        ({ token } = res.body);
        done();
      });
  });

  it('should return 400 bad request when a user tries to login with invalid credentials', (done) => {
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send(sampleData.invalidUser)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        done();
      });
  });

  it('should not login user with valid but wrong credentials', (done) => {
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send(sampleData.incorrectUser)
      .end((err, res) => {
        expect(res).to.have.status(422);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        done();
      });
  });

  it('should return not login user with valid but wrong credentials', (done) => {
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send(sampleData.incorrectUser2)
      .end((err, res) => {
        expect(res).to.have.status(422);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        done();
      });
  });
});

describe('/GET entries', () => {
  it('should return all user entries when passed a valid token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .get('/api/v1/entries')
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('entries');
        done();
      });
  });

  it('should return 401 unauthorized error along with error object when passed an invalid or expired token', (done) => {
    chai
      .request(app)
      .get('/api/v1/entries')
      .set('Authorization', makeAuthHeader(sampleData.invalidToken))
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return 401 unauthorized error along with error object when passed no token', (done) => {
    chai
      .request(app)
      .get('/api/v1/entries')
      .set('Authorization', '')
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return 400 bad request when passed invalid querystring', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .get('/api/v1/entries?filter=true&limit=0&page=page')
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        done();
      });
  });

  it('should return 500 internal error when database throws error', (done) => {
    const queryStub = sinon.stub(pool, 'query').throws(new Error('Query failed'));
    chai
      .request(app)
      // Set the Authorization header
      .get('/api/v1/entries')
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        queryStub.restore();
        done();
      });
  });
});

describe('/POST entries', () => {
  it('should create a new entry when passed valid data and valid token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .post('/api/v1/entries')
      .set('Authorization', makeAuthHeader(token))
      .send(sampleData.validEntry)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.all.keys('id', 'created_on', 'title', 'content', 'is_favorite');
        // cache entry id for future requests
        cachedEntry = res.body;
        entryCreationDate = new Date(res.body.created_on).getTime();
        done();
      });
  });

  it('should return 400 bad request error when passed invalid data and valid token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .post('/api/v1/entries')
      .set('Authorization', makeAuthHeader(token))
      .send(sampleData.invalidEntry)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return 401 unauthorized error when passed valid data with invalid or expired token', (done) => {
    chai
      .request(app)
      .post('/api/v1/entries')
      .set('Authorization', makeAuthHeader(sampleData.invalidToken))
      .send(sampleData.validEntry)
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return 401 unauthorized error when passed valid data with no token', (done) => {
    chai
      .request(app)
      .post('/api/v1/entries')
      .set('Authorization', null)
      .send(sampleData.validEntry)
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should create another entry which is a user favorite when passed valid data and token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .post('/api/v1/entries')
      .set('Authorization', makeAuthHeader(token))
      .send(sampleData.anotherValidEntry)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('is_favorite', true);
        done();
      });
  });

  it('should return 500 error due to database error', (done) => {
    const queryStub = sinon.stub(pool, 'query').throws(new Error('Query failed'));
    chai
      .request(app)
      // Set the Authorization header
      .post('/api/v1/entries')
      .set('Authorization', makeAuthHeader(token))
      .send(sampleData.anotherValidEntry)
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        queryStub.restore();
        done();
      });
  });
});

describe('/GET entries', () => {
  it('should not return an empty array of entries after user adds an entry and sends a valid token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .get('/api/v1/entries')
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('entries');
        expect(res.body.entries.length).to.eql(2);
        expect(res.body.meta).to.have.property('count', 2);
        done();
      });
  });

  it('should return user entries according to query params when passed a valid token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .get('/api/v1/entries?filter=favs&limit=1&page=0')
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('meta');
        const { limit, page, count } = res.body.meta;
        expect(limit).to.eql(1);
        expect(page).to.eql(0);
        expect(count).to.eql(1);
        // the only entry returned is a user favorite
        expect(res.body.entries[0]).to.have.property('is_favorite', true);
        done();
      });
  });

  it('should return user entries according to query params when passed a valid token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .get('/api/v1/entries?limit=1&page=1')
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('meta');
        // just one entry should be returned even though count is 2
        expect(res.body.entries.length).to.eql(1);
        const { limit, page, count } = res.body.meta;
        expect(limit).to.eql(1);
        expect(page).to.eql(1);
        expect(count).to.eql(2);
        done();
      });
  });
});

describe('/GET/:id entries', () => {
  it('should return single user entry with specified existing id when passed a valid token', (done) => {
    chai
      .request(app)
      .get(`/api/v1/entries/${cachedEntry.id}`)
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.eql(cachedEntry);
        done();
      });
  });

  it('should return 400 bad request when passed a valid token but nonexistent id', (done) => {
    chai
      .request(app)
      .get(`/api/v1/entries/${sampleData.invalidEntryId}`)
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return a 404 not found error when passed an invalid entry id and a valid token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .get(`/api/v1/entries/${sampleData.nonExistentId}`)
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return 401 unauthorized error when passed an invalid or expired token', (done) => {
    chai
      .request(app)
      .get(`/api/v1/entries/${cachedEntry.id}`)
      .set('Authorization', makeAuthHeader(sampleData.invalidToken))
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return 500 internal error when database throws error', (done) => {
    const queryStub = sinon.stub(pool, 'query').throws(new Error('Query failed'));
    chai
      .request(app)
      // Set the Authorization header
      .get(`/api/v1/entries/${cachedEntry.id}`)
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        queryStub.restore();
        done();
      });
  });
});

describe('/PUT entries', () => {
  it('should modify an existing entry when passed valid id, data and token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .put(`/api/v1/entries/${cachedEntry.id}`)
      .set('Authorization', makeAuthHeader(token))
      .send(sampleData.incompleteValidEntry)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.eql(Object.assign(cachedEntry, sampleData.incompleteValidEntry));
        done();
      });
  });

  it('should return 400 bad request error when passed invalid data and valid token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .put(`/api/v1/entries/${cachedEntry.id}`)
      .set('Authorization', makeAuthHeader(token))
      .send(sampleData.invalidEntry)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return 401 unauthorized error when passed valid data with invalid or expired token', (done) => {
    chai
      .request(app)
      .put(`/api/v1/entries/${cachedEntry.id}`)
      .set('Authorization', makeAuthHeader(sampleData.invalidToken))
      .send(sampleData.validEntry)
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return 404 not found error when passed valid data, valid token but invalid id', (done) => {
    chai
      .request(app)
      .put(`/api/v1/entries/${sampleData.nonExistentId}`)
      .set('Authorization', makeAuthHeader(token))
      .send(sampleData.validEntry)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return 200 and unmodified data when passed an empty body', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .put(`/api/v1/entries/${cachedEntry.id}`)
      .set('Authorization', makeAuthHeader(token))
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.eql(Object.assign(cachedEntry, sampleData.incompleteValidEntry));
        done();
      });
  });

  it('should return 403 forbidden error when user tries to update entry after 24 hours', (done) => {
    // initialize the clock with entry creation date
    clock = sinon.useFakeTimers(entryCreationDate);
    // set the clock to just over 24 hours later
    clock.tick(sampleData.justOverADay);
    // get a new token 24 hours later
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send(sampleData.validUser)
      .end((err, res) => {
        ({ token } = res.body);
        // run test in nested callback
        chai
          .request(app)
          .put(`/api/v1/entries/${cachedEntry.id}`)
          .set('Authorization', makeAuthHeader(token))
          .send(sampleData.validEntry)
          .end((error, result) => {
            expect(result).to.have.status(403);
            expect(result.body).to.be.an('object');
            expect(result.body).to.be.have.property('error');
            done();
          });
      });
  });
});

describe('/DELETE/:id entries', () => {
  it('should return 401 unauthorized error when passed an invalid or expired token', (done) => {
    chai
      .request(app)
      .delete(`/api/v1/entries/${cachedEntry.id}`)
      .set('Authorization', makeAuthHeader(sampleData.invalidToken))
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return 400 bad request error when passed invalid id', (done) => {
    chai
      .request(app)
      .delete(`/api/v1/entries/${sampleData.invalidEntryId}`)
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should delete a single user entry with specified existing id when passed a valid token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .delete(`/api/v1/entries/${cachedEntry.id}`)
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
  });

  it('should return a 404 not found error when passed a nonexistent id and a valid token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .delete(`/api/v1/entries/${sampleData.nonExistentId}`)
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });
});

describe('/GET profile', () => {
  it('should return 401 unauthorized error when passed an invalid or expired token', (done) => {
    chai
      .request(app)
      .get('/api/v1/profile')
      .set('Authorization', makeAuthHeader(sampleData.invalidToken))
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return user profile when passed a valid token', (done) => {
    chai
      .request(app)
      // Set the Authorization header
      .get('/api/v1/profile')
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.keys(['entries_count', 'fav_count', 'push_sub',
          'reminder_set', 'email', 'created_on']);
        done();
      });
  });

  it('should return 500 server error due to database query error', (done) => {
    const queryStub = sinon.stub(pool, 'query').throws(new Error('Query failed'));
    chai
      .request(app)
      // Set the Authorization header
      .get('/api/v1/profile')
      .set('Authorization', makeAuthHeader(token))
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.be.an('object');
        // createTables() should yield an error under these conditions
        createTables();
        // continue
        expect(res.body).to.be.have.property('error');
        queryStub.restore();
        done();
      });
  });
});

describe('/PUT profile', () => {
  it('should return 204 Ok when passed valid token and valid data', (done) => {
    chai
      .request(app)
      .put('/api/v1/profile')
      .set('Authorization', makeAuthHeader(token))
      .send(sampleData.validProfile)
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
  });

  it('should return 204 Ok when passed empty data', (done) => {
    chai
      .request(app)
      .put('/api/v1/profile')
      .set('Authorization', makeAuthHeader(token))
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
  });

  it('should return 401 unauthorized error when passed an invalid or expired token', (done) => {
    chai
      .request(app)
      .put('/api/v1/profile')
      .set('Authorization', makeAuthHeader(sampleData.invalidToken))
      .send(sampleData.validProfile)
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });

  it('should return 400 bad request error when passed a valid token and invalid data', (done) => {
    chai
      .request(app)
      .put('/api/v1/profile')
      .set('Authorization', makeAuthHeader(token))
      .send(sampleData.invalidProfile)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });
});

describe('/PUT profile error handling', () => {
  it('should return 500 server error due to database query error', (done) => {
    const queryStub = sinon.stub(pool, 'query').throws(new Error('Query failed'));
    chai
      .request(app)
      // Set the Authorization header
      .put('/api/v1/profile')
      .set('Authorization', makeAuthHeader(token))
      .send(sampleData.validProfile)
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        queryStub.restore();
        done();
      });
    done();
  });
});

describe('Daily reminder feature', () => {
  it('should not send a notification when a database error occurs', async () => {
    pool.query.restore();
    sinon.stub(pool, 'query').alwaysCalledWith('invalidQuery');
    const webPushStub = sinon.spy(webpush, 'sendNotification');
    await processNotifications();
    expect(webPushStub.called).to.be.eql(false);
    pool.query.restore();
    webPushStub.restore();
  });

  it('should return a promise that resolves when notification is sent', async () => {
    const webPushStub = sinon.stub(webpush, 'sendNotification');
    webPushStub.resolves();
    await processNotifications();
    expect(webPushStub.called).to.be.eql(true);
    webPushStub.restore();
  });

  it('should return a promise that rejects when notification is not sent', async () => {
    const webPushStub = await sinon.stub(webpush, 'sendNotification').rejects();
    await processNotifications();
    expect(webPushStub.called).to.be.eql(true);
    webPushStub.restore();
  });

  it('should not send a notification when the reminder is not set', async () => {
    await chai
      .request(app)
      .put('/api/v1/profile')
      .set('Authorization', makeAuthHeader(token))
      .send(sampleData.noReminderProfile);
    const webPushSpy = sinon.spy(webpush, 'sendNotification');
    await processNotifications();
    expect(webPushSpy.called).to.be.eql(false);
    webPushSpy.restore();
  });
});
