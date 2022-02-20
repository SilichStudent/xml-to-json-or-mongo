const { MongoClient } = require("mongodb");

const utils = require('../utils');

const mongoUrl = process.env.MONGO_URL;
const databaseName = process.env.MONGO_DATABASE;
const collectionName = process.env.MONGO_COLLECTION;

if(!mongoUrl){
    throw new Error("MONGO_URL env var is required");
}

if(!databaseName){
    throw new Error("MONGO_DATABASE env var is required");
}

if(!collectionName){
    throw new Error("MONGO_COLLECTION env var is required");
}

const client = new MongoClient(mongoUrl);

module.exports = (args) => {
    const block = args.block;

    return client.connect()
        .then(() => console.log("Connected to DB"))
        .then(() => {

            const xml = utils.createStream(args);

            const database = client.db(databaseName);
            const collection = database.collection(collectionName);

            let count = 0;
            let isEnded = false;

            xml.on(`startElement: ${block}`, () => {
                count++;
            })

            xml.on(`endElement: ${block}`, (item) => {
                const currentCount = count;

                utils.xmlObjectToValidJson(item);
                collection.insertOne(item).then(() => {
                    // Немного сложная логика. Таким способом мы закрываем соединение с бд когда был обработан последний элемент
                    if (isEnded && currentCount == count) {
                        console.log("Close connection");
                        client.close();
                    }
                }).catch(err => {
                    console.error(err);
                });
            });

            xml.on('end', () => { 
                isEnded = true;
            })

        }).catch(err => {
            console.error(err);
        })
}
