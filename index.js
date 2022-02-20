require('dotenv').config();

const utils = require('./utils');
const writeToFile = require('./file_writer');
const writeToDb = require('./mongo');


const args = utils.getArgs();

const command = args._[0];


// todo: constants
switch (command) {
    case 'file':
        writeToFile(args);
        break;
    case 'mongo':
        writeToDb(args).then(() => {
            console.log('Writing data to database');
        })
        break;
    default:
        console.error("Not implemented yet");
        return;
}
