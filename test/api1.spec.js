import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { getApi1 } from '../api.js';

chai.use(chaiHttp);

describe('/api-1', () => {
  describe('GET /api-1', () => {
    it('TC-1.1: Should return success response with HTTP 200', async () => {
      const response = await chai.request('http://localhost:8080')
        .get('/api-1')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      
      expect(response).to.have.status(200);
      expect(response.text).to.be.a('string');
      const data = JSON.parse(response.text);
      expect(data).to.be.an('object');
      expect(data).to.have.property('response', 'success');
    });

    it('TC-1.2: Should return HTTP 405 for POST request', async () => {
      const response = await chai.request('http://localhost:8080')
        .post('/api-1')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .catch(err => err.response);
      
      expect(response).to.have.status(405);
      expect(response.body).to.be.an('object');
    });

    it('TC-1.3: Should return success response with HTTP 200 when random query params are present', async () => {
      const response = await chai.request('http://localhost:8080')
        .get('/api-1')
        .query({ test: 'value' })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      
      expect(response).to.have.status(200);
      expect(response.text).to.be.a('string');
      const data = JSON.parse(response.text);
      expect(data).to.be.an('object');
      expect(data).to.have.property('response', 'success');
    });
  });
}); 