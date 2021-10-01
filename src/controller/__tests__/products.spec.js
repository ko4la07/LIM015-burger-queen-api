const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');

const config = require('../../config');

const databaseName = 'test';

beforeAll(async () => {
  const url = `mongodb://127.0.0.1/${databaseName}`;
  await mongoose.connect(url, { useNewUrlParser: true });
});

const adminUser = {
  email: config.adminEmail,
  password: config.adminPassword,
};

/* ------- test GET /products -------- */
describe('GET /products', () => {
  it('should get products with Auth', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .get('/products')
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
