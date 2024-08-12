const request = require('supertest');

const {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
} = require('@jest/globals');
const app = require('../app');
const mongoose = require('mongoose');
const Achievement = require('orange-fondation-api/src/models/achievementModel');
// DATABASE CONNECTION

// DATABASE CONNECTION
beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await Achievement.deleteOne({ title: 'Test Achievement Title' });

  await mongoose.disconnect();
});

describe('Achievement Routes', () => {
  const token = process.env.JEST_TOKEN;

  let achievement;
  beforeAll(async () => {
    // create a new user to use for all tests
    achievement = new Achievement({
      label: 'Test Achievement Title',
      statistics: '25',
    });
    await achievement.save();
  });
  test('GET /achievements', async () => {
    const response = await request(app).get('/v1/api/achievements');

    expect(response.statusCode).toBe(200);
  });
  test('GET /achievements/:id', async () => {
    const response = await request(app).get(
      `/v1/api/achievements/${achievement._id}`,
    );
    expect(response.statusCode).toBe(200);
  });
  describe('POST /achievements', () => {
    test('with valid data', async () => {
      const response = await request(app)
        .post('/v1/api/achievement')
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: 'Test Achievement Title',
          statistics: '25',
        });
      expect(response.statusCode).toBe(201);
    });
    test('with invalid data', async () => {
      const response = await request(app)
        .post('/v1/api/achievement')
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: '',
          statistics: '',
        });
      expect(response.statusCode).toBe(400);
    });
  });
  describe('PUT /achievements/:id', () => {
    test('with valid data', async () => {
      const response = await request(app)
        .put(`/v1/api/achievements/${achievement._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Achievement Title',
          statistics: '25',
        });
      expect(response.statusCode).toBe(200);
    });
    test('wrong achievement id', async () => {
      const response = await request(app)
        .put('/v1/api/achievements/123456789')
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: 'Test Achievement Title',
          statistics: '25',
        });
      expect(response.statusCode).toBe(400);
    });
  });
  describe('DELETE /achievements/:id', () => {
    test('with valid data', async () => {
      const response = await request(app)
        .delete(`/v1/api/achievements/${achievement._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toBe(200);
    });
    test('wrong achievement id', async () => {
      const response = await request(app)
        .delete('/v1/api/achievements/123456789')
        .set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toBe(500);
    });
  });
});
