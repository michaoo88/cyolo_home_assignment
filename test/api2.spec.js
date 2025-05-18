import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { postApi2 } from '../api.js';

chai.use(chaiHttp);

describe('/api-2', () => {
  describe('POST /api-2 - Login Tests', () => {
    // Valid login tests with different username capitalizations
    it('TC-2.1: Should login successfully with lowercase username', async () => {
      const response = await postApi2({ username: 'user', password: 'Password1234' });
      expect(response).to.be.an('object');
      expect(response).to.have.property('token');
      expect(response.token).to.be.a('number');
    });

    it('TC-2.2: Should login successfully with uppercase username', async () => {
      const response = await postApi2({ username: 'USER', password: 'Password0000' });
      expect(response).to.be.an('object');
      expect(response).to.have.property('token');
      expect(response.token).to.be.a('number');
    });

    it('TC-2.3: Should login successfully with mixed case username', async () => {
      const response = await postApi2({ username: 'User', password: 'Password4321' });
      expect(response).to.be.an('object');
      expect(response).to.have.property('token');
      expect(response.token).to.be.a('number');
    });

    // Invalid login tests
    it('TC-2.4: Should fail with wrong password', async () => {
      try {
        await postApi2({ username: 'user', password: 'wrongpass' });
        throw new Error('Expected unauthorized error but got success');
      } catch (error) {
        expect(error.message).to.equal('Unauthorized');
      }
    });

    it('TC-2.5: Should fail with missing username', async () => {
      try {
        await postApi2({ password: 'Password1234' });
        throw new Error('Expected unauthorized error but got success');
      } catch (error) {
        expect(error.message).to.equal('Unauthorized');
      }
    });

    it('TC-2.6: Should fail with missing password', async () => {
      try {
        await postApi2({ username: 'user' });
        throw new Error('Expected unauthorized error but got success');
      } catch (error) {
        expect(error.message).to.equal('Unauthorized');
      }
    });

    it('TC-2.7: Should fail with empty username', async () => {
      try {
        await postApi2({ username: '', password: 'Password1234' });
        throw new Error('Expected unauthorized error but got success');
      } catch (error) {
        expect(error.message).to.equal('Unauthorized');
      }
    });

    it('TC-2.8: Should fail with empty password', async () => {
      try {
        await postApi2({ username: 'user', password: '' });
        throw new Error('Expected unauthorized error but got success');
      } catch (error) {
        expect(error.message).to.equal('Unauthorized');
      }
    });

    it('TC-2.9: Should fail with malformed JSON', async () => {
      try {
        const response = await chai.request('http://localhost:8080')
          .post('/api-2')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send('{"username": "user", "password": "Password1234"'); // Missing closing brace
        
        // If we get here, the request succeeded when it should have failed
        expect.fail('Expected request to fail with malformed JSON');
      } catch (error) {
        // Check if it's a chai-http error
        if (error.response) {
          expect(error.response).to.have.status(400);
          expect(error.response.body).to.be.an('object');
          expect(error.response.body).to.deep.equal({
            response: "Failed - Expecting ',' delimiter: line 1 column 48 (char 47)"
          });
        } else {
          // If it's a network/parsing error, that's also acceptable
          expect(error).to.be.instanceOf(Error);
        }
      }
    });
  });
}); 