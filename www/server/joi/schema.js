const Joi = require('joi');

const maxGeneIdLen = process.env.MAX_GENE_ID_LEN || 255;
const geneIdSchema = Joi.string().min(1).max(maxGeneIdLen);
const geneQuerySchema = Joi.object().keys({
    query:  geneIdSchema.required(),
});

const getMappings = {
    body: Joi.object().keys({
        genes: Joi.array().min(1).items(geneQuerySchema).required(),
    }),
};

module.exports = {
    getMappings,
};