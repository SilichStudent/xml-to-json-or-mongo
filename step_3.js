const fs = require('fs');
const path = require('path');
const XmlStream = require('xml-stream');

// Create a file stream and pass it to XmlStream
var stream = fs.createReadStream(path.join(__dirname, 'step_4.xml'));
var xml = new XmlStream(stream);

xml.collect("desc");
xml.collect("feature");
xml.collect("group");

xml.on('endElement: art', function (item) {
  xmlObjectToValidJson(item);
  console.log(JSON.stringify(item, null, 2));
});

function xmlObjectToValidJson(obj) {
  // Разворачиваем поле "$"
  movePropertyUpALevel(obj)

// Проверяем все поля объекта
  for(let key of Object.keys(obj)){
      
      if(key[0] === "$"){
          // Если имя поля начинается на знак доллара то мы удаляем этот знак
          obj[key.replace("$", "")] = obj[key];
          delete obj[key];
      } else if(obj[key] instanceof Object){
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
  Object.keys(objectToBeMoved).forEach(function (key) {
    parentObject[key] = objectToBeMoved[key];
  });
  delete parentObject["$"];
};
