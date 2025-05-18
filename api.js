import chai from "chai";
import chaiHttp from "chai-http";

chai.use(chaiHttp);
const expect = chai.expect;

const BASE_URL = "http://localhost:8080";

// Function to parse response data based on content type

const parseResponse = (response) => {
  const contentType = response.headers["content-type"] || "";
  if (contentType.includes("application/json")) {
    return response.body;
  }
  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.warn("Response is not JSON, returning raw text");
    return response.text;
  }
};

// GET request to /api-1 endpoint

export async function getApi1(baseUrl = BASE_URL) {
  return new Promise((resolve, reject) => {
    chai
      .request(baseUrl)
      .get("/api-1")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        if (err) {
          console.error("GET /api-1 Error:", err);
          reject(err);
          return;
        }

        try {
          const data = parseResponse(res);
          expect(res).to.have.status(200);
          resolve(data);
        } catch (error) {
          console.error("GET /api-1 Parse Error:", error);
          reject(error);
        }
      });
  });
}

// POST request to /api-2 endpoint for authentication

export async function postApi2({ username, password }, baseUrl = BASE_URL) {
  return new Promise((resolve, reject) => {
    chai
      .request(baseUrl)
      .post("/api-2")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({ username, password })
      .end((err, res) => {
        if (err) {
          console.error("POST /api-2 Error:", err);
          reject(err);
          return;
        }

        try {
          const data = parseResponse(res);

          if (res.status === 200) {
            resolve(data);
          } else if (res.status === 401) {
            reject(new Error("Unauthorized"));
          } else {
            reject(new Error(`Unexpected status: ${res.status}`));
          }
        } catch (error) {
          console.error("POST /api-2 Parse Error:", error);
          reject(error);
        }
      });
  });
}

// POST request to /api-3 endpoint
export async function postApi3(data, baseUrl = BASE_URL, token) {
  return new Promise((resolve, reject) => {
    const request = chai
      .request(baseUrl)
      .post("/api-3")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json");

    if (token) {
      request.set("Authorization", `${token}`);
    }

    request
      .send(data)
      .end((err, res) => {
        if (err) {
          console.error("POST /api-3 Error:", err);
          reject(err);
          return;
        }

        try {
          const responseData = parseResponse(res);

          if (res.status === 200) {
            resolve(responseData);
          } else if (res.status === 401) {
            reject({ status: res.status, body: responseData });
          } else if (res.status === 404) {
            reject({ status: res.status, body: responseData });
          } else {
            reject({ status: res.status, body: responseData });
          }
        } catch (error) {
          console.error("POST /api-3 Parse Error:", error);
          reject(error);
        }
      });
  });
}
