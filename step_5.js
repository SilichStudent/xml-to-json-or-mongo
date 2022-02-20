const fs = require('fs');
const XmlStream = require('xml-stream');
const JSONStream = require('JSONStream');
const yargs = require('yargs');

const argv = yargs
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
  .option('outnput_file', {
    description: 'Output file path',
    type: 'string',
    demandOption: false
  })
  .option('af', {
    description: 'List of array fileds',
    type: 'array',
    demandOption: false
  })
  .help()
  .alias('help', 'h').argv;

const inputFile = argv.input_file;
const block = argv.block;
const outputFile = argv.outnput_file || "output.json";

if(!fs.existsSync(inputFile)){
  throw new Error(`File ${inputFile} doesn't exist`);
}

const writeStream = fs.createWriteStream(outputFile);
const jsonwriter = JSONStream.stringify();
jsonwriter.pipe(writeStream);

// Create a file stream and pass it to XmlStream
var stream = fs.createReadStream(inputFile);
var xml = new XmlStream(stream);

// desc, feature, group
if(argv.af){
  for(let arrayFiled of argv.af){
    xml.collect(arrayFiled);
  }
}


function xmlObjectToValidJson(obj) {
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

function movePropertyUpALevel(parentObject) {
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

xml.on(`endElement: ${block}`, (item) => {
  xmlObjectToValidJson(item);
  jsonwriter.write(item);
});

xml.on('end', () => {
  jsonwriter.end();
})
