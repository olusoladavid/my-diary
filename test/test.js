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

describe('/GET entries', () => {
  it('should return all user entries', (done) => {
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

describe('/GET/:id entries', () => {
  it('should return a single entry by id', (done) => {
    chai
      .request(app)
      .get('/api/v1/entries/1')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.be.eql(1);
        expect(res.body).to.have.property('timestamp');
        expect(res.body).to.have.property('title');
        expect(res.body).to.have.property('content');
        expect(res.body).to.have.property('isFavorite');
        done();
      });
  });

  it('should not return an entry', (done) => {
    chai
      .request(app)
      .get('/api/v1/entries/0')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('errors');
        done();
      });
  });
});

describe('/POST entries', () => {
  it('should add a new entry to user entries', (done) => {
    const entriesLengthBeforeRequest = entries.length;
    const sampleEntry = {
      timestamp: 153677782990,
      title: 'title',
      content: 'content',
      isFavorite: false,
    };
    chai
      .request(app)
      .post('/api/v1/entries')
      .send(sampleEntry)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('timestamp', sampleEntry.timestamp);
        expect(res.body).to.have.property('title', sampleEntry.title);
        expect(res.body).to.have.property('content', sampleEntry.content);
        expect(res.body).to.have.property('isFavorite', sampleEntry.isFavorite);
        expect(entries.length).to.be.eql(entriesLengthBeforeRequest + 1);
        done();
      });
  });

  it('should reject invalid entry', (done) => {
    const entriesLengthBeforeRequest = entries.length;
    chai
      .request(app)
      .post('/api/v1/entries')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('errors');
        expect(entries.length).to.be.eql(entriesLengthBeforeRequest);
        done();
      });
  });
});

describe('/PUT/:id entries', () => {
  it('should modify a previously created entry', (done) => {
    const entriesLengthBeforeRequest = entries.length;
    const modification = {
      title: 'another title',
      isFavorite: true,
    };
    chai
      .request(app)
      .put('/api/v1/entries/1')
      .send(modification)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.be.eql(1);
        expect(res.body).to.have.property('title', modification.title);
        expect(res.body).to.have.property('isFavorite', modification.isFavorite);
        expect(entries.length).to.be.eql(entriesLengthBeforeRequest);
        done();
      });
  });

  it('should reject invalid modification', (done) => {
    const entriesLengthBeforeRequest = entries.length;
    chai
      .request(app)
      .put('/api/v1/entries/1')
      .send({ title: 5 })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('errors');
        expect(entries.length).to.be.eql(entriesLengthBeforeRequest);
        done();
      });
  });

  it('should not modify an entry', (done) => {
    chai
      .request(app)
      .put('/api/v1/entries/0')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('errors');
        done();
      });
  });
});

describe('/DELETE/:id entries', () => {
  it('should delete a single entry by id', (done) => {
    const entriesLengthBeforeRequest = entries.length;
    chai
      .request(app)
      .delete('/api/v1/entries/1')
      .end((err, res) => {
        expect(res).to.have.status(204);
        expect(res.body).to.be.eql({});
        expect(entries.length).to.be.eql(entriesLengthBeforeRequest - 1);
        done();
      });
  });

  it('should not return an entry', (done) => {
    const entriesLengthBeforeRequest = entries.length;
    chai
      .request(app)
      .delete('/api/v1/entries/0')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('errors');
        expect(entries.length).to.be.eql(entriesLengthBeforeRequest);
        done();
      });
  });
});
