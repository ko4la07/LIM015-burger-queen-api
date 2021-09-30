const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');

const config = require('../../config');

const databaseName = 'test';

beforeAll(async () => {
  const url = `mongodb://127.0.0.1/${databaseName}`;
  await mongoose.connect(url, { useNewUrlParser: true });
});

describe('GET /users', () => {
  const adminUser = {
    email: config.adminEmail,
    password: config.adminPassword,
  };

  const userTest = {
    email: 'usertest@test.test',
    password: 'Usertest1',
  };

  it('Should respond 401 when no auth', (done) => {
    request(app)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(401, done);
  });

  it('Should respond 403 when no Admin', (done) => {
    let token = null;
    request(app)
      .post('/auth')
      .send({ email: userTest.email, password: userTest.password })
      .then(((res) => {
        token = res.body.token;
        request(app)
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect('Content-Type', /json/)
          .expect(403, done);
      }));
  });

  it('Should respond with json of all users if is Admin', (done) => {
    let token = null;
    request(app)
      .post('/auth')
      .send({ email: adminUser.email, password: adminUser.password })
      .then(((res) => {
        token = res.body.token;
        request(app)
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            expect(res.body.length > 0).toBe(true);
            expect(Array.isArray(res.body)).toBe(true);
            done();
          });
      }));
  });
});
