const chai = require('chai'),
      chaiHttp = require('chai-http');

let expect = chai.expect;
chai.use(chaiHttp);    

class TestResources {
    constructor() {
        this.serverBaseUrl=process.env.TEST_SERVER_BASE_URL || `http://localhost:${process.env.PORT}`;
    }
    
    async queryGenes(genes) {
        return chai.request(this.serverBaseUrl)
                .get('/mappings')
                .send({"genes": genes.map(gene=>{return {"query":gene}})})
                .set('Content-Type', 'application/json');
    }
    
    async queryGeneExactResult(query) {
        const res = 
                await this.queryGenes([query]);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('genes');
        expect(res.body.genes).to.be.an('array').that.is.not.empty;
        let queryResults = (res.body.genes.filter(gene=>gene.query===query))[0].results;
        expect(queryResults.filter(result=>result.score===1)).to.be.an('array').that.is.not.empty;
    }
}

module.exports = TestResources;