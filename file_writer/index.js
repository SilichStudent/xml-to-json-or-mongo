const fs = require('fs');
const JSONStream = require('JSONStream');

const utils = require('../utils');

module.exports = (args) => {
    const block = args.block;
    const outnputFile = args.outnput_file || "output.json"

    const xmlStream = utils.createStream(args);

    const jsonwriter = createJsonWriter(outnputFile);

    xmlStream.on(`endElement: ${block}`, (item) => {
        utils.xmlObjectToValidJson(item);
        jsonwriter.write(item);
    });

    xmlStream.on('end', () => {
        jsonwriter.end();
    })

}

function createJsonWriter(outputFile) {
    const writeStream = fs.createWriteStream(outputFile);
    const jsonwriter = JSONStream.stringify();
    jsonwriter.pipe(writeStream);

    return jsonwriter;
}
