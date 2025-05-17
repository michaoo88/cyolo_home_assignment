import { expect } from 'chai';
import request from 'supertest';

const BASE_URL = 'http://localhost:8080';

describe('API Tests', function () {
  describe('GET /api-1', function () {
    it('should return success', async function () {
      try {
        const response = await request(BASE_URL)
          .get('/api-1')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');
        
        console.log('GET /api-1 Response Status:', response.status);
        console.log('GET /api-1 Response Headers:', response.headers);
        console.log('GET /api-1 Response Text:', response.text);
        
        const body = JSON.parse(response.text);
        expect(response.status).to.equal(200);
        expect(body).to.be.an('object');
        expect(body).to.have.property('response', 'success');
      } catch (error) {
        console.error('GET /api-1 Error:', error);
        throw error;
      }
    });
  });

  describe('POST /api-2', function () {
    it('should return token for valid credentials', async function () {
      try {
        const response = await request(BASE_URL)
          .post('/api-2')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send({ username: 'User', password: 'Password4321' });
        
        console.log('POST /api-2 Response Status:', response.status);
        console.log('POST /api-2 Response Headers:', response.headers);
        console.log('POST /api-2 Response Text:', response.text);
        
        const body = JSON.parse(response.text);
        expect(response.status).to.equal(200);
        expect(body).to.be.an('object');
        expect(body).to.have.property('token');
      } catch (error) {
        console.error('POST /api-2 Error:', error);
        throw error;
      }
    });

    it('should fail with invalid credentials', async function () {
      try {
        const response = await request(BASE_URL)
          .post('/api-2')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send({ username: 'User', password: 'WrongPass' });
        
        console.log('POST /api-2 (invalid) Response Status:', response.status);
        console.log('POST /api-2 (invalid) Response Headers:', response.headers);
        console.log('POST /api-2 (invalid) Response Text:', response.text);
        
        const body = JSON.parse(response.text);
        expect(response.status).to.equal(401);
        expect(body).to.be.an('object');
        expect(body).to.have.property('response', 'unauthorized');
      } catch (error) {
        console.error('POST /api-2 (invalid) Error:', error);
        throw error;
      }
    });
  });
});
