var c = require('rho-contracts-js');

// Optional simple format for errors, used by `middleware.useContractsOrError`.
module.exports.errorBody = c.object({ error: c.string }).strict()
    .rename('errorBody');
