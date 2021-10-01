const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');

const config = require('../../config');

const databaseName = 'test';

beforeAll(async () => {
  const url = `mongodb://127.0.0.1/${databaseName}`;
  await mongoose.connect(url, { useNewUrlParser: true });
});

describe('POST /auth', () => {
  const adminUser = {
    email: config.adminEmail,
    password: config.adminPassword,
  };

  const userTest = {
    email: 'usertest@test.test',
    password: 'Usertest1',
  };

  it('Should respond 400 for empty body', (done) => {
    request(app)
      .post('/auth')
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({ message: 'email or password missing' });
        done();
      });
  });

  it('Should 404 if the user does not exist', (done) => {
    request(app)
      .post('/auth')
      .send({ email: 'hola@hola.com', password: 'Hola1234' })
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({ message: 'User does not exist' });
        done();
      });
  });

  it('Should respond 404 for invalid password', (done) => {
    request(app)
      .post('/auth')
      .send({ email: adminUser.email, password: 'Hola1234' })
      .expect(404, done);
  });

  it('Should respond 200 and return a token', (done) => {
    request(app)
      .post('/auth')
      .send({ email: adminUser.email, password: adminUser.password })
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: userTest.email, password: userTest.password })
          .then(() => {
            request(app)
              .post('/auth')
              .send({ email: userTest.email, password: userTest.password })
              .expect(200)
              .then((res) => {
                expect(res.body.token).toBeTruthy();
                done();
              });
          });
      });
  });
});
