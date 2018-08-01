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
