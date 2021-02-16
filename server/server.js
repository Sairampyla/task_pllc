


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 8080;

const  { mongoose } = require('./dbconfig')
var employeeController = require('./controllers/employeecontroller');

var app = express();
app.use(bodyParser.json());
app.use(cors())
app.listen(port, () => console.log(`server setup has started
server started at port:8080`))

app.use('/employees',employeeController);

