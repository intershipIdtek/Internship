var mongo = require('./mongo');
var sleep = require('system-sleep');

console.info('\n***************add book_1 and book_2 to collection Books');
mongo.collection("books")
    .add([{ name: "book_1", artist: "thangok", price_per_day: "10000" }, { name: "book_2", artist: "thangok", price_per_day: "15000" }])
    .onSuccess((results) => { console.info(results) })
    .onError((err) => { console.error(err) })
    .perform();

sleep(100);

console.info('\n***************get book_1 from collection Books');
mongo.collection("books")
    .get({ name: "book_1" })
    .onSuccess((results) => { console.info(results) })
    .onError((err) => { console.error(err) })
    .perform();

sleep(100);

console.info('\n***************get book_2 from collection Books');
mongo.collection("books")
    .get({ name: "book_2" })
    .onSuccess((results) => { console.info(results) })
    .onError((err) => { console.error(err) })
    .perform();

sleep(100);

console.info('\n***************remove all book_1 from collection Books');
mongo.collection("books")
    .remove({ name: "book_1" })
    .onSuccess((results) => { console.info(results) })
    .onError((err) => { console.error(err) })
    .perform();

sleep(100);

console.info('\n***************get book_1 again to ensure they have been removed from collection Books');
mongo.collection("books")
    .get({ name: "book_1" })
    .onSuccess((results) => { console.info(results) })
    .onError((err) => { console.error(err) })
    .perform();

sleep(100);

console.info('\n***************rename all book_2 to book_1 from collection Books');
mongo.collection("books")
    .update({ name: "book_2" }, { $set: { name: "book_1" } })
    .onSuccess((results) => { console.info(results) })
    .onError((err) => { console.error(err) })
    .perform();

sleep(100);

console.info('\n***************get book_1 again to ensure all book_2 have been renamed to book_1 in collection Books');
mongo.collection("books")
    .get({ name: "book_1" })
    .onSuccess((results) => { console.info(results) })
    .onError((err) => { console.error(err) })
    .perform();

sleep(100);