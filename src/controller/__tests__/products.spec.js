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

const userTest = {
  email: 'usertest1234@test.test',
  password: 'Usertest1',
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

/* ------- test GET /products/:productId -------- */
describe('GET /products/:productId', () => {
  const productTest = {
    name: 'Hamburguesa Test',
    type: 'Best burgers',
    price: 35,
    image: 'https://www.infobae.com/new-resizer/1YkLtqEyhWFdpQ9XjJVCUrBgrm0=/1200x900/filters:format(jpg):quality(85)//arc-anglerfish-arc2-prod-infobae.s3.amazonaws.com/public/FJKXKQKMMJBV7KQ7XQ3YNFO7LU.jpg',
  };

  it('should fail with 404 when not found', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .get('/products/aaaaaaaaaaaaaaaaaaaaaaaa')
          .set('Authorization', `Bearer ${token}`)
          .expect('Content-Type', /json/)
          .expect(404)
          .then((res) => {
            expect(res.body).toEqual({ message: 'product not found' });
            done();
          });
      }));
  });

  it('should get product with Auth', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .post('/products')
          .set('Authorization', `Bearer ${token}`)
          .send(productTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const productId = response.body._id;
            request(app)
              .get(`/products/${productId}`)
              .set('Authorization', `Bearer ${token}`)
              .expect('Content-Type', /json/)
              .expect(200)
              .then((resp) => {
                expect(resp.body._id).toEqual(productId);
                expect(resp.body.name).toEqual('Hamburguesa Test');
                expect(resp.body.type).toEqual('Best burgers');
                expect(resp.body.price).toEqual(35);
                expect(typeof resp.body.image).toBe('string');
                done();
              });
          });
      }));
  });
});

/* ------- test POST /products -------- */
describe('POST /products', () => {
  const productTest = {
    name: 'Burger Testing',
    type: 'Best burgers',
    price: 30,
    image: 'https://www.infobae.com/new-resizer/1YkLtqEyhWFdpQ9XjJVCUrBgrm0=/1200x900/filters:format(jpg):quality(85)//arc-anglerfish-arc2-prod-infobae.s3.amazonaws.com/public/FJKXKQKMMJBV7KQ7XQ3YNFO7LU.jpg',
  };

  it('Should respond 401 when no auth', (done) => {
    request(app)
      .post('/products')
      .send(productTest)
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({ message: 'no authorization' });
        done();
      });
  });

  it('should fail with 403 when not admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send(userTest)
          .then(() => {
            request(app)
              .post('/auth')
              .send(userTest)
              .then(((res) => {
                const { token } = res.body;
                request(app)
                  .post('/products')
                  .set('Authorization', `Bearer ${token}`)
                  .send(productTest)
                  .expect('Content-Type', /json/)
                  .expect(403)
                  .then((response) => {
                    expect(response.body).toEqual({ message: 'not admin' });
                    done();
                  });
              }));
          });
      });
  });

  it('should fail with 400 when bad props', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/products')
          .set('Authorization', `Bearer ${token}`)
          .send({})
          .expect('Content-Type', /json/)
          .expect(400)
          .then((response) => {
            expect(response.body).toEqual({ message: 'body empty' });
            done();
          });
      });
  });

  it('should create product as admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/products')
          .set('Authorization', `Bearer ${token}`)
          .send(productTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(typeof response.body._id).toBe('string');
            expect(response.body.name).toEqual('Burger Testing');
            expect(response.body.type).toEqual('Best burgers');
            expect(response.body.price).toEqual(30);
            expect(typeof response.body.image).toBe('string');
            done();
          });
      });
  });
});

/* ------- test PUT /products/:productId -------- */
describe('PUT /products/:productId', () => {
  const productTest = {
    name: 'Hamburguesa Test',
    type: 'Best burgers',
    price: 35,
    image: 'https://www.infobae.com/new-resizer/1YkLtqEyhWFdpQ9XjJVCUrBgrm0=/1200x900/filters:format(jpg):quality(85)//arc-anglerfish-arc2-prod-infobae.s3.amazonaws.com/public/FJKXKQKMMJBV7KQ7XQ3YNFO7LU.jpg',
  };

  it('Should respond 401 when no auth', (done) => {
    request(app)
      .put('/products/aaaaaaaaaaaaaaaaaaaaaaaa')
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({ message: 'no authorization' });
        done();
      });
  });

  it('should fail with 403 when not admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send(userTest)
          .then(() => {
            request(app)
              .post('/auth')
              .send(userTest)
              .then(((res) => {
                const { token } = res.body;
                request(app)
                  .put('/products/aaaaaaaaaaaaaaaaaaaaaaaa')
                  .set('Authorization', `Bearer ${token}`)
                  .send(productTest)
                  .expect('Content-Type', /json/)
                  .expect(403)
                  .then((response) => {
                    expect(response.body).toEqual({ message: 'not admin' });
                    done();
                  });
              }));
          });
      });
  });

  it('should fail with 400 when admin and not found', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .put('/products/aaaaaaaaaaaaaaaaaaaaaaaa')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Hamburguesa Test Test' })
          .expect('Content-Type', /json/)
          .expect(400)
          .then((res) => {
            expect(res.body).toEqual({ message: 'the product does not exist' });
            done();
          });
      }));
  });

  it('should fail with 400 when bad props', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/products')
          .set('Authorization', `Bearer ${token}`)
          .send(productTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const productId = response.body._id;

            expect(typeof productId).toBe('string');
            expect(response.body.name).toEqual('Hamburguesa Test');
            expect(response.body.type).toEqual('Best burgers');
            expect(response.body.price).toEqual(35);
            expect(typeof response.body.image).toBe('string');
            request(app)
              .put(`/products/${productId}`)
              .set('Authorization', `Bearer ${token}`)
              .send({ price: 'holahola' })
              .expect('Content-Type', /json/)
              .expect(400)
              .then((resp) => {
                expect(resp.body).toEqual({ message: 'the price must be a number' });
                done();
              });
          });
      });
  });

  it('should update product as admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/products')
          .set('Authorization', `Bearer ${token}`)
          .send(productTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const productId = response.body._id;

            expect(typeof productId).toBe('string');
            expect(response.body.name).toEqual('Hamburguesa Test');
            expect(response.body.type).toEqual('Best burgers');
            expect(response.body.price).toEqual(35);
            expect(typeof response.body.image).toBe('string');

            request(app)
              .put(`/products/${productId}`)
              .set('Authorization', `Bearer ${token}`)
              .send({ name: 'Hamburguesa Test Test' })
              .expect('Content-Type', /json/)
              .expect(200)
              .then((resp) => {
                expect(resp.body._id).toEqual(productId);
                expect(resp.body.name).toEqual('Hamburguesa Test Test');
                expect(resp.body.type).toEqual('Best burgers');
                expect(resp.body.price).toEqual(35);
                expect(typeof resp.body.image).toBe('string');
                done();
              });
          });
      });
  });
});

/* ------- test DELETE /products/:productId -------- */
describe('DELETE /products/:productId', () => {
  const productTest = {
    name: 'Hamburguesa Test Testing',
    type: 'Best burgers',
    price: 35,
    image: 'https://www.infobae.com/new-resizer/1YkLtqEyhWFdpQ9XjJVCUrBgrm0=/1200x900/filters:format(jpg):quality(85)//arc-anglerfish-arc2-prod-infobae.s3.amazonaws.com/public/FJKXKQKMMJBV7KQ7XQ3YNFO7LU.jpg',
  };

  it('Should respond 401 when no auth', (done) => {
    request(app)
      .delete('/products/aaaaaaaaaaaaaaaaaaaaaaaa')
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({ message: 'no authorization' });
        done();
      });
  });

  it('should fail with 403 when not admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send(userTest)
          .then(() => {
            request(app)
              .post('/auth')
              .send(userTest)
              .then(((res) => {
                const { token } = res.body;
                request(app)
                  .delete('/products/aaaaaaaaaaaaaaaaaaaaaaaa')
                  .set('Authorization', `Bearer ${token}`)
                  .expect(403)
                  .then((response) => {
                    expect(response.body).toEqual({ message: 'not admin' });
                    done();
                  });
              }));
          });
      });
  });

  it('should fail with 404 when admin and not found', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .delete('/products/aaaaaaaaaaaaaaaaaaaaaaaa')
          .set('Authorization', `Bearer ${token}`)
          .expect(404)
          .then((response) => {
            expect(response.body).toEqual({ message: 'the product does not exist' });
            done();
          });
      }));
  });

  it('should delete other product as admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/products')
          .set('Authorization', `Bearer ${token}`)
          .send(productTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const productId = response.body._id;

            expect(typeof productId).toBe('string');
            expect(response.body.name).toEqual('Hamburguesa Test Testing');
            expect(response.body.type).toEqual('Best burgers');
            expect(response.body.price).toEqual(35);
            expect(typeof response.body.image).toBe('string');

            request(app)
              .delete(`/products/${productId}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(200)
              .then((response) => {
                expect(response.body).toEqual({ message: 'the product was removed' });
                done();
              });
          });
      });
  });
});
