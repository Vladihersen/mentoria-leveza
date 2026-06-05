// src/watsonxClient.js
const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

let client = null;

function getClient() {
  if (!client) {
    client = WatsonXAI.newInstance({
      authenticator: new IamAuthenticator({
        apikey: process.env.WATSONX_API_KEY,
      }),
      serviceUrl: process.env.WATSONX_URL,
    });
  }
  return client;
}

module.exports = { getClient };
