/* -------------------------------------------------------------------------- */
/*                                DEPENDENCIES                                */
/* -------------------------------------------------------------------------- */
// dependencies
const request = require('supertest');
const {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
} = require('@jest/globals');
const mongoose = require('mongoose');

// Application server
const app = require('../app');

// Models
const Faq = require('orange-fondation-api/src/models/faqModel');

/**
 * @jest-environment node // this is important to avoid the error: "MongoMemoryServer" is not available in the global scope of "node" environment
 * Database connection
 */
beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

describe('Achievement Routes', () => {
  let todeleteid;
  const token = process.env.JEST_TOKEN;

  const question_en = 'Test EN';
  const answer_en = 'Rep EN';
  const question_fr = 'Test FR';
  const answer_fr = 'Rep FR';

  let faq;
  beforeAll(async () => {
    /**
     * Create a new question and answer
     * @type {Faq} faq - Faq model instance
     * @property {string} question_en - Question in english
     * @property {string} answer_en - Answer in english
     * @property {string} question_fr - Question in french
     * @property {string} answer_fr - Answer in french
     */
    faq = new Faq({
      en: {
        question: question_en,
        answer: answer_en,
      },
      fr: {
        question: question_fr,
        answer: answer_fr,
      },
    });
    await faq.save();
  });

  test('GET /faqs', async () => {
    const response = await request(app)
      .get('/v1/api/faqs')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  });
  test('GET /faqs/:id', async () => {
    const response = await request(app)
      .get(`/v1/api/faqs/${faq._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  });
  test('POST /faq', async () => {
    const response = await request(app)
      .post('/v1/api/faq')
      .set('Authorization', `Bearer ${token}`)
      .send({
        question_en: '000 EN',
        answer_en: '000 EN',
        question_fr: '000 FR',
        answer_fr: '000 FR',
      });
    todeleteid = response.body.id;
    expect(response.statusCode).toBe(201);
  });
  test('PUT /faq/:id', async () => {
    const response = await request(app)
      .put(`/v1/api/faqs/${faq._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        question_en: '111 EN',
        answer_en: '111 EN',
        question_fr: '111 FR',
        answer_fr: '111 FR',
      });
    expect(response.statusCode).toBe(200);
  });
  test('DELETE /faq/:id', async () => {
    const response = await request(app)
      .delete(`/v1/api/faqs/${faq._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    const response2 = await request(app)
      .delete(`/v1/api/faqs/${todeleteid}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response2.statusCode).toBe(200);
  });
});

/**
 * Database disconnection after all tests are done
 */
afterAll(async () => {
  await mongoose.disconnect();
});
