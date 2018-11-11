const chai = require('chai'),
      chaiHttp = require('chai-http'),
      testResources = require('./resources');
      
let expect = chai.expect;
chai.use(chaiHttp);    

describe('Mapper', () => {
    let tr = new(testResources);
    
    describe('Symbols', () => {
        it('should return a result with score 1 for query PHA2A',  async () => {
            await tr.queryGeneExactResult('PHA2A');
        });
    });
});