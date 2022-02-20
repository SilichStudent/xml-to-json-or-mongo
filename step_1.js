const fs        = require('fs');
const path      = require('path');
const XmlStream = require('xml-stream');

// Create a file stream and pass it to XmlStream
var stream = fs.createReadStream(path.join(__dirname, 'step_1.xml'));
var xml = new XmlStream(stream);

xml.on('endElement: art', function(item) {
  console.log(JSON.stringify(item, null, 2));
});
