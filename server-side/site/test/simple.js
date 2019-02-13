const assert = require('assert');
const expect = require('chai').expect;
const main = require('../server')
const got   = require('got');

describe('main', function() {
    describe('#start()', function() {
      it('should start server on port 3002', async () => {

          await main.start();

          const response = await got('http://localhost:3002', {timeout:500})
          // Stop server
          await main.stop();
          expect(response.body).to.include('Hi From');
      });
    });
  });