const assert = require('assert');
const expect = require('chai').expect;
const main = require('../server')
const got   = require('got');
const check = require('./analysis');

describe('main', function() {
    describe('#start()', function() {
      it('should start server on port 3002',async () => {
       await main.start();
          const response = await got('http://localhost:3002/api/study/vote/status', {timeout:500})
          // Stop server
         await main.stop();
        assert.equal(200,response.statusCode); 
      });
    });
   describe('metric check', () => {
     it('should pass all metrics', async ()=>{
           var  status = check.analyse();
           assert.equal(true, status);
     });
    });
  });
