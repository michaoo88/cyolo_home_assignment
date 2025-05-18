import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { getApi1, postApi2 } from '../api.js';

chai.use(chaiHttp);

describe('API Integration Tests', () => {
  describe('GET /api-1', () => {
    it('should return a success response', async () => {
      const response = await getApi1();
      expect(response).to.be.an('object');
      expect(response).to.have.property('response', 'success');
    });
  });

  describe('POST /api-2', () => {
    const validCredentials = {
      username: 'User',
      password: 'Password4321'
    };

    const invalidCredentials = {
      username: 'User',
      password: 'WrongPass'
    };

    it('should return a token for valid credentials', async () => {
      const response = await postApi2(validCredentials);
      expect(response).to.be.an('object');
      expect(response).to.have.property('token');
      expect(response.token).to.be.a('number');
    });

    it('should throw unauthorized error for invalid credentials', async () => {
      try {
        await postApi2(invalidCredentials);
        throw new Error('Expected unauthorized error but got success');
      } catch (error) {
        expect(error.message).to.equal('Unauthorized');
      }
    });
  });
});
