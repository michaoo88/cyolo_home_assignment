import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { postApi2, postApi3 } from '../api.js';

chai.use(chaiHttp);

describe('Token Independence Tests', () => {
  it('TC-4.0: Should handle multiple valid tokens independently', async () => {
    // Get first token
    const response1 = await postApi2({ username: 'user', password: 'Password1234' });
    expect(response1).to.be.an('object');
    expect(response1).to.have.property('token');
    const token1 = response1.token;

    // Get second token
    const response2 = await postApi2({ username: 'User', password: 'Password4321' });
    expect(response2).to.be.an('object');
    expect(response2).to.have.property('token');
    const token2 = response2.token;

    // Test both tokens with the same request
    const result1 = await postApi3({ num_a: 1, num_b: 2 }, 'http://localhost:8080', token1);
    expect(result1).to.be.an('object');
    expect(result1).to.have.property('total');
    expect(result1.total).to.equal(3);

    const result2 = await postApi3({ num_a: 1, num_b: 2 }, 'http://localhost:8080', token2);
    expect(result2).to.be.an('object');
    expect(result2).to.have.property('total');
    expect(result2.total).to.equal(3);
  });
}); 