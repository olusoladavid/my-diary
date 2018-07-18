// import http from 'http';
// import assert from 'assert';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server/index';

const { expect } = chai;
chai.use(chaiHttp);

describe('API base', () => {
  it('should return 200', (done) => {
    chai
      .request(app)
      .get('/api/v1')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
