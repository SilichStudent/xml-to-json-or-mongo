const yargs = require('yargs');
const XmlStream = require('xml-stream');
const fs = require('fs');

const xmlObjectToValidJson = (obj) => {
    // Разворачиваем поле "$"
    movePropertyUpALevel(obj)

    // Проверяем все поля объекта
    for (let key of Object.keys(obj)) {

        if (key[0] === "$") {
            // Если имя поля начинается на знак доллара то мы удаляем этот знак
            obj[key.replace("$", "")] = obj[key];
            delete obj[key];
        } else if (obj[key] instanceof Object) {
            // Если в поле содержится объект то его тоже наддо привести к нормальному виду
            xmlObjectToValidJson(obj[key]);
        }
    }
}

const movePropertyUpALevel = (parentObject) => {
    // Проверка на то что у нас есть такое поле в объекте
    if (!parentObject["$"]) {
        return;
    }

    // Достаем все поля из объекта "$" и переносим их на уровень выше
    const objectToBeMoved = parentObject["$"];
    Object.keys(objectToBeMoved).forEach((key) => {
        parentObject[key] = objectToBeMoved[key];
    });
    delete parentObject["$"];
};

module.exports.xmlObjectToValidJson = xmlObjectToValidJson;

module.exports.createStream = (args) => {
    const inputFile = args.input_file;
    const arrayFileds = args.af;

    if (!fs.existsSync(inputFile)) {
        throw new Error(`File ${inputFile} doesn't exist`);
    }

    // Create a file stream and pass it to XmlStream
    const stream = fs.createReadStream(inputFile);
    const xmlStream = new XmlStream(stream);

    // desc, feature, group
    if (arrayFileds) {
        for (let arrayFiled of arrayFileds) {
            xmlStream.collect(arrayFiled);
        }
    }

    return xmlStream;
}

module.exports.getArgs = () => yargs
    .option('input_file', {
        description: 'Xml input file',
        type: 'string',
        demandOption: true
    })
    .option('block', {
        description: 'Block name',
        type: 'string',
        demandOption: true
    })
    .option('af', {
        description: 'List of array fileds',
        type: 'array',
        demandOption: false
    })
    .option('outnput_file', {
        description: 'Output file path',
        type: 'string',
        demandOption: false
    })
    .command('file', 'Write data to json file', () => {
        console.log("RUN FILE");
    })
    .command("mongo", 'Write data to mongodb')
    .demandCommand(1)
    .help()
    .alias('help', 'h').argv;
