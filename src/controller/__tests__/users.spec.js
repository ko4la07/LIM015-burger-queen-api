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

/* ------- test GET /users -------- */
describe('GET /users', () => {
  it('Should respond 401 when no auth', (done) => {
    request(app)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(401, done);
  });

  it('Should respond 403 when no Admin', (done) => {
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
                  .get('/users')
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(403, done);
              }));
          });
      });
  });

  it('Should respond with json of all users if is Admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
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

/* ------- test GET /users/:uid -------- */
describe('GET /users/:uid', () => {
  it('Should respond 401 when no auth', (done) => {
    request(app)
      .get(`/users/${adminUser.email}`)
      .expect('Content-Type', /json/)
      .expect(401, done);
  });

  it('should fail with 403 when not owner nor admin', (done) => {
    request(app)
      .post('/auth')
      .send(userTest)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .get(`/users/${adminUser.email}`)
          .set('Authorization', `Bearer ${token}`)
          .expect('Content-Type', /json/)
          .expect(403, done);
      }));
  });

  it('should fail with 404 when admin and not found', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .get('/users/hola@hola.hola')
          .set('Authorization', `Bearer ${token}`)
          .expect('Content-Type', /json/)
          .expect(404, done);
      }));
  });

  it('should get own user', (done) => {
    request(app)
      .post('/auth')
      .send(userTest)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .get(`/users/${userTest.email}`)
          .set('Authorization', `Bearer ${token}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.email).toBe(userTest.email);
            done();
          });
      }));
  });

  it('should get other user as admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .get(`/users/${userTest.email}`)
          .set('Authorization', `Bearer ${token}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.email).toBe(userTest.email);
            done();
          });
      }));
  });
});

/* ------- test POST /users -------- */
describe('POST /users', () => {
  it('should respond with 400 when email and password missing', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send({})
          .expect('Content-Type', /json/)
          .expect(400)
          .then((response) => {
            expect(response.body).toEqual({ message: 'email or password missing' });
            done();
          });
      }));
  });

  it('should fail with 400 when invalid email', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'hola@hola', password: 'Hola1234' })
          .expect('Content-Type', /json/)
          .expect(400)
          .then((response) => {
            expect(response.body).toEqual({ message: 'invalid email or password' });
            done();
          });
      }));
  });

  it('should fail with 400 when invalid password', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'hola@hola.hola', password: 'xxx' })
          .expect('Content-Type', /json/)
          .expect(400)
          .then((response) => {
            expect(response.body).toEqual({ message: 'invalid email or password' });
            done();
          });
      }));
  });

  it('should create new user as admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: `hola-${Date.now()}@hola.hola`, password: 'Hola1234' })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(typeof response.body.email).toBe('string');
            expect(typeof response.body._id).toBe('string');
            expect(typeof response.password).toBe('undefined');
            done();
          });
      }));
  });

  it('should create new admin user as admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: `admin-${Date.now()}@hola.hola`, password: 'Admin1234', roles: ['admin'] })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(typeof response.body.email).toBe('string');
            expect(typeof response.body._id).toBe('string');
            expect(typeof response.password).toBe('undefined');
            done();
          });
      }));
  });

  it('should fail with 403 when user is already registered', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send(adminUser)
          .expect('Content-Type', /json/)
          .expect(403)
          .then((response) => {
            expect(response.body).toEqual({ message: 'The email is already registered' });
            done();
          });
      }));
  });
});

/* ------- test PUT /users/:uid -------- */
describe('PUT /users/:uid', () => {
  it('should fail with 401 when no auth', (done) => {
    request(app)
      .put(`/users/${userTest.email}`)
      .send({ email: userTest.email, password: userTest.password })
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({ message: 'no authorization' });
        done();
      });
  });

  it('should fail with 403 when not owner nor admin', (done) => {
    request(app)
      .post('/auth')
      .send(userTest)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .put('/users/usertest@test.test')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'holauser@hola.com', password: 'Hola1234' })
          .expect('Content-Type', /json/)
          .expect(403)
          .then((response) => {
            expect(response.body).toEqual({ message: 'Unauthorized' });
            done();
          });
      }));
  });

  it('should fail with 404 when admin and not found', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .put('/users/holamundo@test.test')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'holauser@hola.com', password: 'Hola1234' })
          .expect('Content-Type', /json/)
          .expect(404)
          .then((response) => {
            expect(response.body).toEqual({ message: 'user not found' });
            done();
          });
      }));
  });

  it('should fail with 400 when no props to update', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .put('/users/usertest@test.test')
          .set('Authorization', `Bearer ${token}`)
          .send({})
          .expect('Content-Type', /json/)
          .expect(400)
          .then((response) => {
            expect(response.body).toEqual({ message: 'nothing to update' });
            done();
          });
      }));
  });

  it('should fail with 403 when not admin tries to change own roles', (done) => {
    request(app)
      .post('/auth')
      .send(userTest)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .put(`/users/${userTest.email}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ roles: ['admin'] })
          .expect('Content-Type', /json/)
          .expect(403)
          .then((response) => {
            expect(response.body).toEqual({ message: 'require admin role' });
            done();
          });
      }));
  });

  it('should update user when own data (password change)', (done) => {
    request(app)
      .post('/auth')
      .send(userTest)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .put(`/users/${userTest.email}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ password: userTest.password })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(typeof response.body.email).toBe('string');
            expect(typeof response.body._id).toBe('string');
            expect(typeof response.password).toBe('undefined');
            done();
          });
      }));
  });

  it('should update user when admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .put(`/users/${userTest.email}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ password: userTest.password })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(typeof response.body.email).toBe('string');
            expect(typeof response.body._id).toBe('string');
            expect(typeof response.password).toBe('undefined');
            done();
          });
      }));
  });
});

/** ------- test DELETE /users/:uid -------- */
describe('DELETE /users/:uid', () => {
  it('should fail with 401 when no auth', (done) => {
    request(app)
      .delete(`/users/${userTest.email}`)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({ message: 'no authorization' });
        done();
      });
  });

  it('should fail with 403 when not owner nor admin', (done) => {
    request(app)
      .post('/auth')
      .send(userTest)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .delete('/users/usertest@test.test')
          .set('Authorization', `Bearer ${token}`)
          .expect(403)
          .then((response) => {
            expect(response.body).toEqual({ message: 'not admin or not owner' });
            done();
          });
      }));
  });

  it('should fail with 404 when admin and not found', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then(((res) => {
        const { token } = res.body;
        request(app)
          .delete('/users/holamundo@test.test')
          .set('Authorization', `Bearer ${token}`)
          .expect(404)
          .then((response) => {
            expect(response.body).toEqual({ message: 'user not found' });
            done();
          });
      }));
  });

  it('should delete own user', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'mundoverde@test.test', password: 'User1234' })
          .expect('Content-Type', /json/)
          .expect(200)
          .then(() => {
            request(app)
              .post('/auth')
              .send({ email: 'mundoverde@test.test', password: 'User1234' })
              .then((response) => {
                request(app)
                  .delete('/users/mundoverde@test.test')
                  .set('Authorization', `Bearer ${response.body.token}`)
                  .expect(200, done);
              });
          });
      });
  });

  it('should delete other user as admin', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .then((res) => {
        const { token } = res.body;
        request(app)
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'testmundo@test.test', password: 'User1234' })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((userResponse) => {
            const emailUserTest = userResponse.body.email;
            expect(emailUserTest).toBeTruthy();
            request(app)
              .delete('/users/testmundo@test.test')
              .set('Authorization', `Bearer ${token}`)
              .expect(200, done);
          });
      });
  });
});
