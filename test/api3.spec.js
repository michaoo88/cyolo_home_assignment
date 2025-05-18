import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { postApi2, postApi3 } from '../api.js';

chai.use(chaiHttp);

describe('/api-3', () => {
  let validToken;

  beforeEach(async () => {
    // Get a valid token before each test
    const response = await postApi2({ username: 'user', password: 'Password1234' });
    validToken = response.token || response; // Handle both response formats
  });

  describe('POST /api-3 - Arithmetic Tests', () => {
    it('TC-3.1: Should return total = 3 with valid token and numbers', async () => {
      const response = await postApi3({ num_a: 1, num_b: 2 }, 'http://localhost:8080', validToken);
      expect(response).to.be.an('object');
      expect(response).to.have.property('total');
      expect(response.total).to.equal(3);
    });

    it('TC-3.2: Should fail with missing token', async () => {
      try {
        await postApi3({ num_a: 1, num_b: 2 });
        throw new Error('Expected unauthorized error but got success');
      } catch (error) {
        expect(error.status).to.equal(401);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response', 'Token not valid');
      }
    });

    it('TC-3.3: Should fail with invalid token', async () => {
      try {
        await postApi3({ num_a: 1, num_b: 2 }, 'http://localhost:8080', 'invalid-token');
        throw new Error('Expected unauthorized error but got success');
      } catch (error) {
        expect(error.status).to.equal(401);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response', 'Token not valid');
      }
    });

    it('TC-3.4: Should fail with num_a as string', async () => {
      const response = await postApi3({ num_a: '1', num_b: 2 }, 'http://localhost:8080', validToken);
      expect(response).to.be.an('object');
      expect(response).to.have.property('total');
      expect(response.total).to.equal(3);
    });

    it('TC-3.5: Should fail with missing num_a', async () => {
      try {
        await postApi3({ num_b: 2 }, 'http://localhost:8080', validToken);
        throw new Error('Expected not found error but got success');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response', 'wrong input');
      }
    });

    it('TC-3.6: Should fail with num_a as null', async () => {
      try {
        await postApi3({ num_a: null, num_b: 2 }, 'http://localhost:8080', validToken);
        throw new Error('Expected error but got success');
      } catch (error) {
        expect(error.status).to.equal(501);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response');
        expect(error.body.response).to.equal("Failed - int() argument must be a string, a bytes-like object or a number, not 'NoneType'");
      }
    });

    it('TC-3.7: Should fail with num_a as undefined', async () => {
      try {
        await postApi3({ num_a: undefined, num_b: 2 }, 'http://localhost:8080', validToken);
        throw new Error('Expected not found error but got success');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response', 'wrong input');
      }
    });

    it('TC-3.8: Should accept string numbers and return correct total', async () => {
      const response = await postApi3({ num_a: 1, num_b: '2' }, 'http://localhost:8080', validToken);
      expect(response).to.be.an('object');
      expect(response).to.have.property('total');
      expect(response.total).to.equal(3);
    });

    it('TC-3.9: Should fail with missing num_b', async () => {
      try {
        await postApi3({ num_a: 1 }, 'http://localhost:8080', validToken);
        throw new Error('Expected not found error but got success');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response', 'wrong input');
      }
    });

    it('TC-3.10: Should fail with num_b as null', async () => {
      try {
        await postApi3({ num_a: 1, num_b: null }, 'http://localhost:8080', validToken);
        throw new Error('Expected error but got success');
      } catch (error) {
        expect(error.status).to.equal(501);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response');
        expect(error.body.response).to.equal("Failed - int() argument must be a string, a bytes-like object or a number, not 'NoneType'");
      }
    });

    it('TC-3.11: Should fail with num_b as undefined', async () => {
      try {
        await postApi3({ num_a: 1, num_b: undefined }, 'http://localhost:8080', validToken);
        throw new Error('Expected not found error but got success');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response', 'wrong input');
      }
    });

    it('TC-3.12: Should fail with empty object', async () => {
      try {
        await postApi3({}, 'http://localhost:8080', validToken);
        throw new Error('Expected not found error but got success');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response', 'wrong input');
      }
    });

    it('TC-3.13: Should fail with non-numeric values', async () => {
      try {
        await postApi3({ num_a: 'abc', num_b: 'def' }, 'http://localhost:8080', validToken);
        throw new Error('Expected not found error but got success');
      } catch (error) {
        expect(error.status).to.equal(501);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response', "Failed - invalid literal for int() with base 10: 'abc'");
      }
    });

    it('TC-3.14: Should fail with array values', async () => {
      try {
        await postApi3({ num_a: [1], num_b: [2] }, 'http://localhost:8080', validToken);
        throw new Error('Expected not found error but got success');
      } catch (error) {
        expect(error.status).to.equal(501);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response', "Failed - int() argument must be a string, a bytes-like object or a number, not 'list'");
      }
    });

    it('TC-3.15: Should fail with object values', async () => {
      try {
        await postApi3({ num_a: { value: 1 }, num_b: { value: 2 } }, 'http://localhost:8080', validToken);
        throw new Error('Expected error but got success');
      } catch (error) {
        expect(error.status).to.equal(501);
        expect(error.body).to.be.an('object');
        expect(error.body).to.have.property('response');
        expect(error.body.response).to.equal("Failed - int() argument must be a string, a bytes-like object or a number, not 'dict'");
      }
    });



    it('TC-3.16: Should handle extra fields and still return correct total', async () => {
      const response = await postApi3({ num_a: 1, num_b: 2, extra_field: 'value' }, 'http://localhost:8080', validToken);
      expect(response).to.be.an('object');
      expect(response).to.have.property('total');
      expect(response.total).to.equal(3);
    });
  });
}); 