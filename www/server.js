const express = require('express'),
      bodyParser = require('body-parser'),
      helmet = require('helmet'),
      httpsRedirect = require('express-https-redirect'),
      winston = require('winston'),
      validate = require('express-validation'),
      schema = require('./server/joi/schema'),
      mapper = require('./server/mapper/mapper');    
    
// Default log level is info, unless overriddden by env var
winston.level = process.env.LOG_LEVEL || 'info';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// Middleware that generates debug logs, does nothing if log level is higher than debug
app.use((req,res,next)=>{
      winston.debug(`${JSON.stringify(req.method)} ${req.originalUrl}, body: ${JSON.stringify(req.body)}, headers: ${JSON.stringify(req.headers)}`);
      next();
});


// Ladies 'n' gentlemen this is your captain speaking. Please buckle your seatbelts as we prepare for take off.    
app.use(helmet());
// On production automatically redirect http to https
if (process.env.NODE_ENV === 'production') {
    app.use('/', httpsRedirect());
}
    
// Serve static SPA assets
// app.use(express.static(path.join(__dirname, './client/www')));

// Acknowledge successful completion of express request sending back req.body     
const ok = httpStatus => (req, res, next) => res.status(httpStatus || 200).send(req.body);

app.get('/mappings',validate(schema.getMappings),mapper.queryGenes, ok());


app.use((err, req, res, next) => {
      
    if (err instanceof validate.ValidationError) {
        // Joi schema validation failed, i.e. user input is invalid
        winston.info(`${JSON.stringify(req.method)} ${req.originalUrl} ${JSON.stringify(req.body)}: ${err}`); 
        // Generate a meaningful error message for the user based on Joi validation error.
        // Format of validation error:
        // {"status":400,"statusText":"Bad Request","errors":[{"field":"user.last_name","location":"body","messages":["\"last_name\" is required"],"types":["any.required"]}]}
        // We return each error in err.errors on a newline.
        // For each error, we return the location, field and any messages (separated by ;).
        res.status(err.status)
           .send(err.errors.reduce((output, error)=>
                    output+=`${error.location}: ${error.field} - ${error.messages.reduce((acc,cur,idx,arr)=>acc+=cur+(idx===arr.length-1 ? "" : "; "),"")}\n`,""));
        return;
    } 
    
    // Any other errors indicate a server exception, so log it and let user know we messed up
    winston.error(`${JSON.stringify(req.method)} ${req.originalUrl}: ${err.stack || err}`);
    res.status(500).send('Internal server error, please try again later');
});
      


app.set('port', process.env.PORT || 5000);
    
app.listen(app.get('port'), () => winston.info(`Express server listening on port ${app.get('port')}`));    

    