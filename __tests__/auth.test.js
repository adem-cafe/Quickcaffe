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
const User = require('orange-fondation-api/src/models/UserModel');
// DATABASE CONNECTION

// DATABASE CONNECTION
beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await User.deleteOne({ email: 'johndoe@example.com' });
  await User.deleteOne({ email: 'jtesdoe@example.com' });
  await User.deleteOne({ email: 'newemail@gmail.com' });
  await User.deleteOne({ email: 'oldmail@gmail.com' });
  await User.deleteOne({ email: 'testemail@gmail.com' });

  await mongoose.disconnect();
});

describe('User Routes', () => {
  let user;
  const password = 'testpassword';
  const token = process.env.JEST_TOKEN;
  let currenttoken;
  beforeAll(async () => {
    // create a new user to use for all tests
    user = new User({
      fullName: 'John Doe',
      email: 'johndoe@example.com',
      password: 'testpassword',
      phoneNumber: '+1234567890',
    });
    await user.save();
  });

  describe('GET /users', () => {
    test('should return all users', async () => {
      const response = await request(app)
        .get('/v1/api/users')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
    });
  });

  describe('GET /users/:id', () => {
    test('should return a single user by id', async () => {
      const response = await request(app)
        .get(`/v1/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.user.fullName).toBe(user.fullName);
    });
    test('should return a message if user is not found', async () => {
      const response = await request(app)
        .get('/v1/api/users/123')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(500);
    });
  });
  describe('Check if Email is already in use', () => {
    test('should return a message if email exists', async () => {
      const response = await request(app)
        .post('/v1/api/auth/user-email')
        .send({ email: user.email });
      expect(response.status).toBe(200);
    });
    test('should return a message if email is not provided', async () => {
      const response = await request(app)
        .post('/v1/api/auth/user-email')
        .send({ email: '' });
      expect(response.status).toBe(400);
    });
    test('should return a message if email is not in use', async () => {
      const response = await request(app)
        .post('/v1/api/auth/user-email')
        .send({ email: 'blablabla@gmail.com' });
      expect(response.status).toBe(404);
    });
  });
  describe('SignUp', () => {
    test('should return a message if email and password are not enterd', async () => {
      const response = await request(app)
        .post('/v1/api/auth/register')
        .send({ email: '', password: '' });
      expect(response.status).toBe(400);
    });
    test('should return a message if email is not enterd', async () => {
      const response = await request(app)
        .post('/v1/api/auth/register')
        .send({ email: '', password });
      expect(response.status).toBe(400);
    });
    test('should return a message if password is not enterd', async () => {
      const response = await request(app)
        .post('/v1/api/auth/register')
        .send({ email: user.email, password: '' });
      expect(response.status).toBe(400);
    });
    test('should return a success message if signup is done', async () => {
      const response = await request(app).post('/v1/api/auth/register').send({
        fullName: 'John Doe',
        email: 'jtesdoe@example.com',
        password: 'testpassword',
        phoneNumber: '+1234567890',
      });
      expect(response.status).toBe(201);
    });
  });
  describe('Activate Account', () => {
    test('should return a message if account is activated', async () => {
      const testuser = await User.findOne({ email: 'jtesdoe@example.com' });
      const response = await request(app).put(
        `/v1/api/account/${testuser._id}/enable`,
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Compte a été activé');
    });
  });

  describe('Login', () => {
    test('should return a message if email and password are not enterd', async () => {
      const response = await request(app)
        .post('/v1/api/auth/login')
        .send({ email: '', password: '' });
      expect(response.status).toBe(404);
    });
    test('should return a message if email is not enterd', async () => {
      const response = await request(app)
        .post('/v1/api/auth/login')
        .send({ email: '', password });
      expect(response.status).toBe(404);
    });
    test('should return a message if inputs are wrong', async () => {
      const response = await request(app)
        .post('/v1/api/auth/login')
        .send({ email: 'invalidemail', password: 'invalidpassword' });
      expect(response.status).toBe(404);
    });
    test('should return a message if password is incorrect', async () => {
      const response = await request(app)
        .post('/v1/api/auth/login')
        .send({ email: user.email, password: 'invalidpassword' });
      expect(response.status).toBe(401);
    });
    test('should return a message if account is not activated', async () => {
      const response = await request(app)
        .post('/v1/api/auth/login')
        .send({ email: 'inactive@mail.test', password: 'testpassword' });
      expect(response.status).toBe(405);
    });
    test('should return a success message if login is done', async () => {
      const response = await request(app)
        .post('/v1/api/auth/login')
        .send({ email: 'jtesdoe@example.com', password: 'testpassword' });
      expect(response.status).toBe(200);
      currenttoken = response.body.token;
    });
  });
  describe('Get current user', () => {
    test('should return a message if user is found', async () => {
      const response = await request(app)
        .get('/v1/api/users/me')
        .set('Authorization', `Bearer ${currenttoken}`);
      expect(response.status).toBe(200);
    });
    test('should return a message if user is not found or invalid token', async () => {
      const response = await request(app)
        .get('/v1/api/users/me')
        .set('Authorization', `Bearer hsqhdgsqjg`);
      expect(response.status).toBe(403);
    });
  });
  describe('Update User', () => {
    test('should return a message if user is updated', async () => {
      const userToUpdate = new User({
        fullName: 'John Doe',
        email: 'oldmail@gmail.com',
        phoneNumber: '+1234567890',
        password: 'testpassword',
      });
      await userToUpdate.save();

      const updatedUser = {
        fullName: 'new name',
        email: 'testemail@gmail.com',
        phoneNumber: '+99999',
        password: 'testpassword',
      };

      const testUser = await User.findOne({ email: 'oldmail@gmail.com' });
      const response = await request(app)
        .put(`/v1/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          phoneNumber: updatedUser.phoneNumber,
        });
      expect(response.status).toBe(200);
      expect(response.body.updatedPost.fullName).toBe(updatedUser.fullName);
      expect(response.body.updatedPost.phoneNumber).toBe(
        updatedUser.phoneNumber,
      );
      expect(response.body.message).toBe('User updated successfully');
    });
    test('should return a message if user is not found', async () => {
      const response = await request(app)
        .put(`/v1/api/users/kjhgdqskhgd`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'not important',
          fullName: 'not important',
          phoneNumber: 'not important',
        });
      expect(response.status).toBe(500);
    });
  });

  describe('Update Password', () => {
    test('should return a message if the forgot password demand is activated', async () => {
      const response = await request(app)
        .post('/v1/api/auth/forget-password')
        .send({ email: user.email });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Veuillez vérifier votre e-mail pour plus d'instructions",
      );
    });
    test('should return a message if entered email is not found while declaring forgot password', async () => {
      const response = await request(app)
        .post('/v1/api/auth/forget-password')
        .send({ email: 'invalidemail' });
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found.');
    });
    test('should return a message if the new password and the verify password are not the same', async () => {
      const testUser = await User.findOne({ email: user.email });
      const response = await request(app)
        .post(`/v1/api/auth/reset-password/${testUser.resetPasswordToken}`)
        .send({
          newPassword: 'password1',
          verifyPassword: 'password2',
          token: testUser.resetPasswordToken,
        });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Les mots de passe ne correspondent pas',
      );
    });
    test('should return a message if rest-password-token is invalid', async () => {
      const response = await request(app)
        .post(`/v1/api/auth/reset-password/invalidtoken`)
        .send({
          newPassword: 'password1',
          verifyPassword: 'password1',
          token: 'invalidtoken',
        });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Le token de réinitialisation du mot de passe est invalide ou a expiré',
      );
    });
    test('should return a message if the password is reset', async () => {
      const testUser = await User.findOne({ email: user.email });
      const response = await request(app)
        .post(`/v1/api/auth/reset-password/${testUser.resetPasswordToken}`)
        .send({
          newPassword: 'newpassword',
          verifyPassword: 'newpassword',
          token: testUser.resetPasswordToken,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        'Réinitialisation du mot de passe réussie',
      );
    });
  });
  describe('disable account', () => {
    test('should return a message if the account is disabled', async () => {
      const response = await request(app)
        .put(`/v1/api/account/${user._id}/disable`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
    });
  });
  describe('delete account', () => {
    test('should return a message if the account is not found', async () => {
      const response = await request(app)
        .delete(`/v1/api/users/kjhgdqskhgd`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(500);
    });
    test('should return a message if the requirer of the action is not admin', async () => {
      const response = await request(app)
        .delete(`/v1/api/users/${user._id}`)
        .set('Authorization', `Bearer token`);
      expect(response.status).toBe(403);
    });
    test('should return a message if the account is deleted', async () => {
      const response = await request(app)
        .delete(`/v1/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
    });
  });
});
