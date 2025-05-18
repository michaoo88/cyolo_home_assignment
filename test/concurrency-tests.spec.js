import chai from 'chai';
import chaiHttp from 'chai-http';
import { postApi2, postApi3 } from '../api.js';
const { expect } = chai;

chai.use(chaiHttp);

describe('API Concurrency Tests', () => {
    const validUsername = 'User';  
    const validPassword = 'Password4321';
    const invalidPassword = 'WrongPassword123';

    describe('TC-5.0: Multiple Concurrent Logins', () => {
        it('should handle 9 concurrent login requests successfully', async () => {
            const requests = [];
            
            // Create 9 login requests with the valid username
            for (let i = 0; i < 9; i++) {
                requests.push(
                    postApi2({ username: validUsername, password: validPassword })
                        .catch(error => {
                            console.error(`Login ${i + 1} failed:`, error.message);
                            throw error;
                        })
                );
            }

            const responses = await Promise.allSettled(requests);
            
            // Log results 
            console.log('Login responses:', responses.map((r, index) => ({
                request: `Login attempt ${index + 1}`,
                status: r.status,
                success: r.status === 'fulfilled' ? '✓' : '✗',
                error: r.reason?.message || 'none'
            })));

            // Check that all requests were successful
            responses.forEach((response, index) => {
                expect(response.status).to.equal('fulfilled', 
                    `Request ${index} failed: ${response.reason?.message || 'Unknown error'}`);
                expect(response.value).to.have.property('token');
                expect(response.value.token).to.be.a('number');
            });
        });
    });

    describe('TC-5.1: Concurrent Arithmetic Operations with One Token', () => {
        it('should handle 10 concurrent arithmetic operations with same token', async () => {
            const loginResponse = await postApi2({ username: validUsername, password: validPassword });
            const token = loginResponse.token;

            const requests = [];
            // Create 10 requests with different num_a values
            for (let i = 1; i <= 10; i++) {
                requests.push(
                    postApi3({ num_a: i, num_b: 2 }, undefined, token)
                        .catch(error => {
                            console.error(`Arithmetic operation ${i} failed:`, error);
                            throw error;
                        })
                );
            }

            const responses = await Promise.allSettled(requests);
            
            // Log results
            console.log('Arithmetic responses:', responses.map((r, index) => ({
                request: `Operation ${index + 1}`,
                input: `num_a: ${index + 1}, num_b: 2`,
                status: r.status,
                result: r.value?.total || 'failed',
                expected: index + 1 + 2
            })));

            // Check that all requests were successful
            responses.forEach((response, index) => {
                expect(response.status).to.equal('fulfilled', 
                    `Request ${index} failed: ${response.reason?.message || 'Unknown error'}`);
                expect(response.value).to.have.property('total');
                expect(response.value.total).to.equal(index + 1 + 2); // num_a + 2
            });
        });
    });

    describe('TC-5.2: Simultaneous Token + Arithmetic Flow', () => {
        it('should handle parallel login and arithmetic operations', async () => {
            // Create 5 login requests
            const loginRequests = Array(5).fill().map(() => 
                postApi2({ username: 'User', password: validPassword })
            );

            const loginResponses = await Promise.all(loginRequests);
            const tokens = loginResponses.map(response => `${response.token}`);

            // Create 5 requests with different tokens
            const arithmeticRequests = tokens.map((token, index) => 
                postApi3({ num_a: index + 1, num_b: 2 }, undefined, token)
            );

            const arithmeticResponses = await Promise.all(arithmeticRequests);
            
            arithmeticResponses.forEach((response, index) => {
                expect(response).to.have.property('total');
                expect(response.total).to.equal(index + 1 + 2);
            });
        });
    });

    describe('TC-5.3: Concurrent Invalid Logins', () => {
        it('should handle 10 concurrent invalid login attempts', async () => {
            const requests = Array(10).fill().map(() => 
                postApi2({ username: 'User', password: invalidPassword })
            );

            const responses = await Promise.allSettled(requests);
            
            responses.forEach(response => {
                expect(response.status).to.equal('rejected');
                expect(response.reason).to.be.an('Error');
                expect(response.reason.message).to.equal('Unauthorized');
            });
        });
    });

    describe('TC-5.4: Mixed Valid/Invalid Arithmetic Requests', () => {
        it('should handle mixed valid and invalid arithmetic requests', async () => {
           
            const loginResponse = await postApi2({ username: validUsername, password: validPassword });
            const token = loginResponse.token;

            const requests = [
                // 5 valid requests
                postApi3({ num_a: 1, num_b: 2 }, undefined, token),
                postApi3({ num_a: 2, num_b: 2 }, undefined, token),
                postApi3({ num_a: 3, num_b: 2 }, undefined, token),
                postApi3({ num_a: 4, num_b: 2 }, undefined, token),
                postApi3({ num_a: 5, num_b: 2 }, undefined, token),
                
                // 5 invalid requests
                postApi3({ num_a: 1 }, undefined, token), // missing num_b
                postApi3({ num_b: 2 }, undefined, token), // missing num_a
                postApi3({}, undefined, token), // empty payload
                postApi3({ num_a: 'invalid', num_b: 2 }, undefined, token), // invalid num_a type
                postApi3({ num_a: 1, num_b: 'invalid' }, undefined, token) // invalid num_b type
            ];

            const responses = await Promise.allSettled(requests);
            
            // Log results 
            console.log('Mixed request responses:', responses.map((r, index) => {
                if (r.status === 'fulfilled') {
                    return {
                        request: `Valid request ${index + 1}`,
                        status: r.status,
                        total: r.value.total
                    };
                } else {
                    return {
                        request: `Invalid request ${index + 1}`,
                        status: r.status,
                        error: r.reason.body.response,
                        statusCode: r.reason.status
                    };
                }
            }));

            // Check valid requests
            for (let i = 0; i < 5; i++) {
                expect(responses[i].status).to.equal('fulfilled', 
                    `Valid request ${i} failed: ${responses[i].reason?.message || 'Unknown error'}`);
                expect(responses[i].value).to.have.property('total');
                expect(responses[i].value.total).to.equal(i + 1 + 2);
            }

            // Check invalid requests
            for (let i = 5; i < 10; i++) {
                expect(responses[i].status).to.equal('rejected', 
                    `Invalid request ${i} should have failed but succeeded`);
                expect(responses[i].reason).to.have.property('status');
                expect(responses[i].reason.status).to.be.oneOf([404, 501], 
                    `Invalid request ${i} returned unexpected status: ${responses[i].reason.status}`);
                
                // Check error messages 
                if (i === 5 || i === 6) { // missing num_a or num_b
                    expect(responses[i].reason.body).to.have.property('response', 'wrong input');
                } else if (i === 7) { // empty payload
                    expect(responses[i].reason.body).to.have.property('response', 'wrong input');
                } else { // invalid type for num_a or num_b
                    expect(responses[i].reason.body).to.have.property('response')
                        .that.includes('invalid literal for int()');
                }
            }
        });
    });
}); 