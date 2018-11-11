const db=require('../../../db/pghelper'),
      winston=require('winston');

const pureNumeric = /^\d+$/;

const geneIds = ['symbol', 'gene_name','gene_id','ensembl_id'];
    
// Utility functions for generating postgres "similarity" queries based on trigrams,
// as supported by the pg_tgrm extension module (https://www.postgresql.org/docs/current/pgtrgm.html)
const geneQuerySelect = (column,value) => `SELECT symbol AS Gene_Symbol, 
                                            gene_name AS Gene_Name, 
                                            array_agg(alias_symbol ORDER BY a._id) AS Gene_Aliases, 
                                            gene_id AS ENTREZ_GENE_ID, 
                                            ensembl_id AS ENSEMBL_GENE_ID,
                                            similarity(${column},${value}) AS score
                                     FROM genes g 
                                          LEFT JOIN gene_info gi ON g._id=gi._id 
                                          LEFT JOIN alias a ON g._id=a._id 
                                          LEFT JOIN ensembl e on g._id=e._id`;

const geneQueryWhere = (column,value) => `WHERE ${column} % ${value}`; 

const geneQueryGroupBy = `GROUP BY ${geneIds.join(',')}`;

const geneQueryOrderBy = `ORDER BY score DESC`;

// We allow max geneQueryResultsLimit results per individual similarity query.
// Env var GENE_QUERY_RESULTS_LIMIT can be used to change the limit.
const geneQueryResultsLimit = `LIMIT ${process.env.GENE_QUERY_RESULTS_LIMIT || 5}`;

const geneIdsQuery = (column,value) => `${geneQuerySelect(column,value)} ${geneQueryWhere(column,value)} ${geneQueryGroupBy} ${geneQueryOrderBy} ${geneQueryResultsLimit}`;

// Run a DB query of gene for similarity against column
const queryAgainst = async (gene,column) => db.query(geneIdsQuery(column,'$1'),[gene.query]);

// Map a single gene query
const mapOne = async gene => {
    // Check for similarity of gene to any geneIds, in parallel
    gene.results = (await Promise.all(geneIds.map(id=>queryAgainst(gene,id))))
                        // Flatten all results received from Promise.all
                        .reduce((acc,cur)=>acc.concat(cur))
                        // Sort based on score (highest score first)
                        .sort((a,b)=>b.score - a.score)
                        // Filter out any duplicate results based on entrez_gene_id
                        .filter((elem,idx,orig)=>orig.findIndex(el=>el.entrez_gene_id===elem.entrez_gene_id)===idx);
                        
    winston.info(`gene.results: ${JSON.stringify(gene.results)}`);
};

// Middleware to handle a query pertaining to a list of gene id queries in req.body.genes.
// 
// Example format of input in req.body:
// {"genes" : [{"query":"PHTP2A"}]}
//
// This middleware adds an array of mapping results to each element of req.body.genes, e.g:
// {"genes":[{"query":"PHTP2A","results":[{"gene_symbol":"PHA2A","gene_name":"Pseudohypoaldosteronism type II (gene A)","gene_aliases":["PHA2","PHA2A"],"entrez_gene_id":"7830","ensembl_gene_id":null,"score":0.3},{"gene_symbol":"PHTF1","gene_name":"putative homeodomain transcription factor 1","gene_aliases":["PHTF","PHTF1"],"entrez_gene_id":"10745","ensembl_gene_id":"ENSG00000116793","score":0.3},{"gene_symbol":"PHTF2","gene_name":"putative homeodomain transcription factor 2","gene_aliases":["PHTF2"],"entrez_gene_id":"57157","ensembl_gene_id":"ENSG00000006576","score":0.3}]}]}
//
// If no mappings are found, results is [], e.g:
// {"genes":[{"query":"PHTPG2A","results":[]}]}
//
// This middleware should only be used after the appropriate Joi schema validation has passed,
// so if this middleware is called, req.body.genes is guaranteed to exist and to be in the expected format.
const queryGenes = async (req,res,next) => {
    try {
            // Map all input gene queries in parallel            
            await Promise.all(req.body.genes.map(async gene=>mapOne(gene)));
            next();
            
    } catch(err) {
        next(err);
    }
};

module.exports = {
    queryGenes,
};
