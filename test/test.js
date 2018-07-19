import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server/index';
import entries from '../server/db/entries';

const { expect } = chai;
chai.use(chaiHttp);


describe('/GET API base', () => {
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

describe('/GET entry', () => {
  it('it should GET all entries', (done) => {
    chai
      .request(app)
      .get('/api/v1/entries')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.be.eql(entries.length);
        done();
      });
  });
});
