const db=require('../../../db/pghelper'),
      winston=require('winston');

const pureNumeric = /^\d+$/;

const geneIds = ['symbol', 'gene_name', 'alias_symbol','gene_id','ensembl_id'];
    

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

const geneQueryResultsLimit = `LIMIT ${process.env.GENE_QUERY_RESULTS_LIMIT || 5}`;

const geneIdsQuery = (column,value) => `${geneQuerySelect(column,value)} ${geneQueryWhere(column,value)} ${geneQueryGroupBy} ${geneQueryOrderBy} ${geneQueryResultsLimit}`;

const queryAgainst = async (gene,column) => db.query(geneIdsQuery(column,'$1'),[gene.query]);

const mapOne = async gene => {
    gene.results = (await Promise.all(geneIds.map(id=>queryAgainst(gene,id))))
                        .reduce((acc,cur)=>acc.concat(cur))
                        .sort((a,b)=>b.score - a.score)
                        .filter((elem,idx,orig)=>orig.findIndex(el=>el.entrez_gene_id===elem.entrez_gene_id)===idx);
                        
    winston.info(`gene.results: ${JSON.stringify(gene.results)}`);
};

const queryGenes = async (req,res,next) => {
    try {
            
            await Promise.all(req.body.genes.map(async gene=> mapOne(gene)));
            next();
            
    } catch(err) {
        next(err);
    }
};

module.exports = {
    queryGenes,
};
