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

const orderTest = {
  userId: '614a59c8adbcbe7c6a627fe6',
  client: 'Client',
  products: [
    { qty: 2, productId: '6149f6fdeb097441843c6848' },
    { qty: 1, productId: '6149f7508ea2641cd4fe7c88' },
  ],
};

/* ------- test GET /orders -------- */
describe('GET /orders', () => {
  it('Should respond 401 when no auth', (done) => {
    request(app)
      .get('/orders')
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({ message: 'no authorization' });
        done();
      });
  });

  it('should get orders as user', (done) => {
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
                  .get('/orders')
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .then((response) => {
                    expect(response.body.length > 0).toBe(true);
                    expect(Array.isArray(response.body)).toBe(true);
                    done();
                  });
              }));
          });
      });
  });

  it('should get orders as admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .get('/orders')
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

/* ------- test GET /orders/:orderId -------- */
describe('GET /orders/:orderId', () => {
  it('Should respond 401 when no auth', (done) => {
    request(app)
      .get('/orders/aaaaaaaaaaaaaaaaaaaaaaaa')
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({ message: 'no authorization' });
        done();
      });
  });

  it('should get orders as user', (done) => {
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
                  .post('/orders')
                  .set('Accept', 'application/json')
                  .set('Authorization', `Bearer ${token}`)
                  .send(orderTest)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .then((resp) => {
                    request(app)
                      .get(`/orders/${resp.body._id}`)
                      .set('Authorization', `Bearer ${token}`)
                      .expect('Content-Type', /json/)
                      .expect(200)
                      .then((response) => {
                        expect(response.body._id).toEqual(resp.body._id);
                        expect(typeof response.body.userId).toEqual('string');
                        expect(response.body.client).toEqual('Client');
                        expect(Array.isArray(response.body.products)).toBe(true);
                        expect(response.body.status).toEqual('pending');
                        done();
                      });
                  });
              }));
          });
      });
  });

  it('should get orders as admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/orders')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send(orderTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((resp) => {
            request(app)
              .get(`/orders/${resp.body._id}`)
              .set('Authorization', `Bearer ${token}`)
              .expect('Content-Type', /json/)
              .expect(200)
              .then((response) => {
                expect(response.body._id).toEqual(resp.body._id);
                expect(typeof response.body.userId).toEqual('string');
                expect(response.body.client).toEqual('Client');
                expect(Array.isArray(response.body.products)).toBe(true);
                expect(response.body.status).toEqual('pending');
                done();
              });
          });
      });
  });
});

/* ------- test POST /orders -------- */
describe('POST /orders', () => {
  it('Should respond 401 when no auth', (done) => {
    request(app)
      .post('/orders')
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({ message: 'no authorization' });
        done();
      });
  });

  it('should fail with 400 when bad props', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .set('Accept', 'application/json')
          .send({})
          .expect('Content-Type', /json/)
          .expect(400)
          .then((response) => {
            expect(response.body).toEqual({ message: 'not products' });
            done();
          });
      }));
  });

  it('should fail with 400 when bad props', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .set('Accept', 'application/json')
          .send({ products: [] })
          .expect('Content-Type', /json/)
          .expect(400)
          .then((response) => {
            expect(response.body).toEqual({ message: 'not products' });
            done();
          });
      }));
  });

  it('should create order as user (own order)', (done) => {
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
              .then((response) => {
                const { token } = response.body;
                request(app)
                  .post('/orders')
                  .set('Authorization', `Bearer ${token}`)
                  .send(orderTest)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .then((response) => {
                    expect(typeof response.body._id).toEqual('string');
                    expect(typeof response.body.userId).toEqual('string');
                    expect(response.body.client).toEqual('Client');
                    expect(Array.isArray(response.body.products)).toBe(true);
                    expect(response.body.status).toEqual('pending');
                    done();
                  });
              });
          });
      });
  });

  it('should create order as admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .send(orderTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(typeof response.body._id).toEqual('string');
            expect(typeof response.body.userId).toEqual('string');
            expect(response.body.client).toEqual('Client');
            expect(Array.isArray(response.body.products)).toBe(true);
            expect(response.body.status).toEqual('pending');
            done();
          });
      });
  });
});

/* ------- test PUT /orders/:orderId -------- */
describe('PUT /orders/:orderId', () => {
  it('Should respond 401 when no auth', (done) => {
    request(app)
      .put('/orders/aaaaaaaaaaaaaaaaaaaaaaaa')
      .expect('Content-Type', /json/)
      .send({ Client: 'Client test' })
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({ message: 'no authorization' });
        done();
      });
  });

  it('should fail with 404 when not found', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .put('/orders/aaaaaaaaaaaaaaaaaaaaaaaa')
          .set('Authorization', `Bearer ${token}`)
          .send({ Client: 'Client test' })
          .expect('Content-Type', /json/)
          .expect(404)
          .then((response) => {
            expect(response.body).toEqual({ message: 'the order does not exist' });
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
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .send(orderTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const orderId = response.body._id;

            expect(typeof response.body._id).toEqual('string');
            expect(typeof response.body.userId).toEqual('string');
            expect(response.body.client).toEqual('Client');
            expect(Array.isArray(response.body.products)).toBe(true);
            expect(response.body.status).toEqual('pending');

            request(app)
              .put(`/orders/${orderId}`)
              .set('Authorization', `Bearer ${token}`)
              .send({})
              .expect(400)
              .then((response) => {
                expect(response.body).toEqual({ message: 'body empty' });
                done();
              });
          });
      });
  });

  it('should fail with 400 when bad status', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .send(orderTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const orderId = response.body._id;

            expect(typeof response.body._id).toEqual('string');
            expect(typeof response.body.userId).toEqual('string');
            expect(response.body.client).toEqual('Client');
            expect(Array.isArray(response.body.products)).toBe(true);
            expect(response.body.status).toEqual('pending');

            request(app)
              .put(`/orders/${orderId}`)
              .set('Authorization', `Bearer ${token}`)
              .send({ status: 'basstatus' })
              .expect(400)
              .then((response) => {
                expect(response.body).toEqual({ message: 'status incorrect' });
                done();
              });
          });
      });
  });

  it('should update order (set status to preparing)', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .send(orderTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const orderId = response.body._id;

            expect(typeof response.body._id).toEqual('string');
            expect(typeof response.body.userId).toEqual('string');
            expect(response.body.client).toEqual('Client');
            expect(Array.isArray(response.body.products)).toBe(true);
            expect(response.body.status).toEqual('pending');

            request(app)
              .put(`/orders/${orderId}`)
              .set('Authorization', `Bearer ${token}`)
              .send({ status: 'preparing' })
              .expect(200)
              .then((response) => {
                expect(response.body.status).toEqual('preparing');
                done();
              });
          });
      });
  });

  it('should update order (set status to delivering)', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .send(orderTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const orderId = response.body._id;

            expect(typeof response.body._id).toEqual('string');
            expect(typeof response.body.userId).toEqual('string');
            expect(response.body.client).toEqual('Client');
            expect(Array.isArray(response.body.products)).toBe(true);
            expect(response.body.status).toEqual('pending');

            request(app)
              .put(`/orders/${orderId}`)
              .set('Authorization', `Bearer ${token}`)
              .send({ status: 'delivering' })
              .expect(200)
              .then((response) => {
                expect(response.body.status).toEqual('delivering');
                done();
              });
          });
      });
  });

  it('should update order (set status to delivered)', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .send(orderTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const orderId = response.body._id;

            expect(typeof response.body._id).toEqual('string');
            expect(typeof response.body.userId).toEqual('string');
            expect(response.body.client).toEqual('Client');
            expect(Array.isArray(response.body.products)).toBe(true);
            expect(response.body.status).toEqual('pending');

            request(app)
              .put(`/orders/${orderId}`)
              .set('Authorization', `Bearer ${token}`)
              .send({ status: 'delivered' })
              .expect(200)
              .then((response) => {
                expect(response.body.status).toEqual('delivered');
                done();
              });
          });
      });
  });
});

/* ------- test DELETE /orders/:orderId -------- */
describe('DELETE /orders/:orderId', () => {
  it('Should respond 401 when no auth', (done) => {
    request(app)
      .delete('/orders/aaaaaaaaaaaaaaaaaaaaaaaa')
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({ message: 'no authorization' });
        done();
      });
  });

  it('should fail with 404 when not found', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .delete('/orders/aaaaaaaaaaaaaaaaaaaaaaaa')
          .set('Authorization', `Bearer ${token}`)
          .expect('Content-Type', /json/)
          .expect(404)
          .then((response) => {
            expect(response.body).toEqual({ message: 'the order does not exist' });
            done();
          });
      }));
  });

  it('should delete other order as admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .send(orderTest)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const orderId = response.body._id;

            expect(typeof response.body._id).toEqual('string');
            expect(typeof response.body.userId).toEqual('string');
            expect(response.body.client).toEqual('Client');
            expect(Array.isArray(response.body.products)).toBe(true);
            expect(response.body.status).toEqual('pending');

            request(app)
              .delete(`/orders/${orderId}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(200)
              .then((response) => {
                expect(response.body).toEqual({ message: 'the order was removed' });
                done();
              });
          });
      });
  });
});
