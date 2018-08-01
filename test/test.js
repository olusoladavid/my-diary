import chai from 'chai';
import chaiHttp from 'chai-http';
import { before } from 'mocha';
import app from '../server/index';
import sampleData from './sampleData';
import { query } from '../server/db/index';

const { expect } = chai;
chai.use(chaiHttp);

let token; // for caching token for further requests
let cachedEntry; // for caching retrieved entry for later comparison

const makeAuthHeader = authToken => `Bearer ${authToken}`;

before(() => {
  // remove all entries
  query('TRUNCATE TABLE entries CASCADE', (err, res) => {
    if (err) {
      console.log(err);
    }
  });
  // remove all users
  query('TRUNCATE TABLE users CASCADE', (err, res) => {
    if (err) {
      console.log(err);
    }
  });
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
        token = res.body.token;
        console.log(token);
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

  it('should return 422 unprocessable request when a user tries to login with the valid but wrong credentials', (done) => {
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
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.be.equals(0);
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
      .set('Authorization', makeAuthHeader(''))
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.have.property('error');
        done();
      });
  });
});
