var express = require('express');
var mongo = require('./database/mongo');
var sleep = require('system-sleep');
var http = require('http');
var multer = require('multer');
var cookies = require('cookie-parser');
var Mongo = require('mongodb');

var app = express();
var fs = require('fs');
var json;

app.use(cookies());

//set Cookie
  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    res.cookies = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
//get Cookie
  function getCookie(cname,req) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(req.cookies);
      var ca = decodedCookie.split(';');
      for(var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return "";
  }
//var json = JSON.parse(fs.readFileSync(__dirname + '/resources/book_data.json', 'utf8'));
//// Monggo ###########
  var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/local";
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
        db.collection("book").findOne({}, function(err, result) {
        if (err) throw err;
        json = result;
      });
    });

  app.use(express.static('public'));

// create book :
  app.get('/createBook', function(req, res) {
    var book_name = req.query.book_name;
    var artist = req.query.artist;
    var price_per_day = req.query.price_per_day;
    var all_book_array1;
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
          var myobj={"book_name":book_name,"artist":artist,"price_per_day":price_per_day};
        if ((book_name=="")&&(artist==""))
          return;
        db.collection("book").update({ book_store: "nhà sách Nguyễn Văn Cừ"},
          { "$push": 
            {"all_books": myobj }
          }
          );
            db.collection("book").findOne({"book_store":"nhà sách Nguyễn Văn Cừ"}, function(err, result){
              if (err) throw err;
              all_book_array1=result.all_books;
              res.end(JSON.stringify(all_book_array1));
            });
            });
    });
// remove book từ nhà sách!!
  app.get('/removeBook', function(req, res) {
    var book_name_remove = req.query.book_name_remove;
    var all_book_array2; 
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
        db.collection("book").update({ book_store: "nhà sách Nguyễn Văn Cừ"},
        { "$pull": 
          {"all_books": {
            "book_name": book_name_remove
          }
          }
        });
          db.collection("book").findOne({"book_store":"nhà sách Nguyễn Văn Cừ"}, function(err, result){
            if (err) throw err;
            all_book_array2=result.all_books;
            res.end(JSON.stringify(all_book_array2));

          });
    });
  });

//hàm xóa chuỗi có dấu 
  function bodauTiengViet(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
  }
// search bar:######
  app.get('/searchBook', function(req, res) {
    res.set({
        'content-type': 'application/json; charset=utf-8'
    });
    var bookNameSearch = req.query.book_name_search;
    var allBookArray = [];
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("book").findOne({"book_store": "nhà sách Nguyễn Văn Cừ"}, function(err, result) {
        if (err) throw err;
        allBookArray = result.all_books;
  
        var i = 0;
        var a = [];
        var data1, data2, data3;

        while(i < allBookArray.length) {
          var j = 0 ;
          data1 = allBookArray[i].book_name.split(" "); //console.log(data1);
          data3 = bodauTiengViet(allBookArray[i].book_name).split(" "); //console.log(data3);
          while (j < data1.length) {
            data2 = bookNameSearch.split(" ");
            var k = 0;
            while (k < data2.length) {
              if (data1[j] == data2[k] || data3[j] == data2[k]) {
                if (!(a.includes(allBookArray[i]))) 
                  a.push(allBookArray[i]);
              } 
              k++;
            }
            j++;
          }
        i++;
      }
      console.log(a);
      if (a) 
        res.end(JSON.stringify(a));
      else res.end(JSON.stringify(""));
    });
    db.close();
  });  
  });
//LOGIN
  app.get('/login', function(req, res) {
    res.set({
        'content-type': 'application/json; charset=utf-8'
    });
    var pass = req.query.pass;
    var username = req.query.username;
    var id = "";
    var i = 0;
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
          db.collection("customer_account").findOne({"username": username}, function(err, result) {
            temp = result;
            if ( result.username == username & result.password == pass) {
                  id += result.username;
                  console.log(id);  
                  res.end(JSON.stringify(id));
                }
            else if (result.username != username & result.password != pass) { 
                id += "err";
                console.log(id);
                res.end(JSON.stringify(id));
                }
          });
        db.close();     
      });
  });
// LOG_OUT: #####
  app.get('/logout', function(req, res){
    res.set({
        'content-type': 'application/json; charset=utf-8'
    });
      var id = [];
      MongoClient.connect(url, function(err, db){
        if (err) throw err;
          id = req.cookies.username;
          //console.log("id cookie là: ", id);
          res.end(JSON.stringify(''));
      });
  });
// giỏ hàng
  app.get('/giohang', function(req, res) {
    res.set({
      'content-type': 'application/json; charset=utf-8'
    });
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
          db.collection("customer_account").find({}).toArray(function(err, result) {
            if (err) throw err;
            var json = result;
            var username = req.cookies.username;
            var price = [];
            var total_money = 0;
            var i = 0;
              while(i < json.length){
                if( json[i].username == username){
                  res.end(JSON.stringify(json[i].book_name));
              }
                i++;
              }
              
              db.collection("customer_account").findOne({"username": username}, function (err, value){
                var j = 0;
                var val = value.book_name;
                while (j < val.length){
                    price = val[j].price_per_day;  //console.log("price: ", price);
                    total_money = total_money + Number(price); //console.log("total money: " ,total_money);
                    j++;
                }
            });
        });  
    });     
  });
  // tổng tiền !!!:  
  app.get('/tongtien', function(req, res) {
    res.set({ 
      'content-type': 'application/json; charset=utf-8'
    });
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
          db.collection("customer_account").find({}).toArray(function(err, result) {
            if (err) throw err;
            var json = result;
            var username = req.cookies.username;
            var price = [];
            var total_money = 0;
            
              db.collection("customer_account").findOne({"username": username}, function (err, value){
                var j = 0;
                  var val = value.book_name;//console.log(val);
                  if (val) {
                    while (j < val.length){
                        price = val[j].price_per_day;  console.log("price: ", price);
                        total_money = total_money + Number(price); //console.log("total money: " ,total_money);
                        j++;
                    }
                  }
                  console.log(total_money);
                res.end(JSON.stringify(total_money));  
              });
          });  
    });     
  });
// --- code showbook onload trên web ---
  app.get('/showbook', function(req, res) {
    res.set({
      'content-type': 'application/json; charset=utf-8'
    });
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
          db.collection("book").findOne({"book_store":"nhà sách Nguyễn Văn Cừ"}, function(err, result) {
          if (err) throw err;
      var json = result;
      var name = req.query.name;
      var artist = req.query.artist;
      var price_per_day = req.query.price_per_day;
      var all_book_array= json.all_books;    
      res.end(JSON.stringify(all_book_array));
        });    
      });     
  });
// --- datsach cho khách hàng ---
  app.get('/datsach', function(req, res) {
    res.set({
      'content-type': 'application/json; charset=utf-8'
    });
    MongoClient.connect(url, function(err, db) {
      var username = req.cookies.username;// console.log(username);
      var checkbox =  req.query.checkbox;  console.log(checkbox); // lấy dữ liệu từ checkbox
      if (err) throw err;
      db.collection("book").findOne({"book_store":"nhà sách Nguyễn Văn Cừ"}, function(err, result){
        if (err) throw err;
        var array_datsach = [];
        var i = 0;
        var all_book_array = result.all_books;
            while ( i < all_book_array.length){
                if (checkbox == null){
                    array_datsach = "None";
                    res.end(JSON.stringify(""));
                }else if (checkbox.includes(all_book_array[i].id)){
                    array_datsach.push(all_book_array[i]);
                }
              i++;
            }
                db.collection("customer_account").update({ username: username },
                  {
                    "$addToSet":
                      { "book_name": { "$each":array_datsach}}
                  });  
         // insert vào collection datsach trong Mongo
            // db.collection("datsach").insert({
            //   "username": username,
            //   "book_name": array_datsach
            // });
              //console.log(array_datsach);
              res.end(JSON.stringify(array_datsach));
      });
    });    
  });

// --- xóa sách đã đặt từ user:
  app.get('/xoasach', function(req, res) {
    var username = req.cookies.username; console.log(username);
    var checkbox =  req.query.checkbox;  console.log(checkbox);
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
        if (checkbox == null) {
          res.end(JSON.stringify(""));
        }else {
          checkbox.forEach(function (element) {
            db.collection("customer_account").updateOne({"username":username},
              { $pull: 
                  {"book_name": 
                    { "id": element }
                  }
              });
            res.end(JSON.stringify("win"));  
          });
        }
    });
  });
//#### code show book theo caption ####
// caption: truyện tranh
  app.get('/truyentranh', function(req, res) {
    res.set({
      'content-type': 'application/json; charset=utf-8'
    });
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        //tìm sách theo caption
          db.collection("book").findOne({"book_store":"nhà sách Nguyễn Văn Cừ"}, function(err, result) {
            if (err) throw err;
            var json = result;
            var i = 0;
            var all_book_array5 = json.all_books;    
            var caption_array = [];
          while(i < all_book_array5.length){
            if(all_book_array5[i].caption == "truyện tranh"){
              caption_array.push(all_book_array5[i]);
            }
              i++;
            }
      res.end(JSON.stringify(caption_array));
        });  
      });     
  });
// caption: tiểu thuyết
  app.get('/tieuthuyet', function(req, res) {
    res.set({
      'content-type': 'application/json; charset=utf-8'
    });
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        //tìm sách theo caption
          db.collection("book").findOne({"book_store":"nhà sách Nguyễn Văn Cừ"}, function(err, result) {
            if (err) throw err;
            var json = result;
            var i = 0;
            var all_book_array5 = json.all_books;    
            var caption_array = [];
          while(i < all_book_array5.length){
            if(all_book_array5[i].caption == "tiểu thuyết"){
              caption_array.push(all_book_array5[i]);
            }
              i++;
            }
      res.end(JSON.stringify(caption_array));
        });  
      });     
  });
// caption: trinh thám
  app.get('/trinhtham', function(req, res) {
    res.set({
      'content-type': 'application/json; charset=utf-8'
    });
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        //tìm sách theo caption
          db.collection("book").findOne({"book_store":"nhà sách Nguyễn Văn Cừ"}, function(err, result) {
            if (err) throw err;
            var json = result;
            var i = 0;
            var all_book_array5 = json.all_books;    
            var caption_array = [];
          while(i < all_book_array5.length){
            if(all_book_array5[i].caption == "trinh thám"){
              caption_array.push(all_book_array5[i]);
            }
              i++;
            }
      res.end(JSON.stringify(caption_array));
        });  
      });     
  });
// caption: ngôn tình
  app.get('/ngontinh', function(req, res) {
    res.set({
      'content-type': 'application/json; charset=utf-8'
    });
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        //tìm sách theo caption
          db.collection("book").findOne({"book_store":"nhà sách Nguyễn Văn Cừ"}, function(err, result) {
            if (err) throw err;
            var json = result;
            var i = 0;
            var all_book_array5 = json.all_books;    
            var caption_array = [];
          while(i < all_book_array5.length){
            if(all_book_array5[i].caption == "ngôn tình"){
              caption_array.push(all_book_array5[i]);
            }
              i++;
            }
      res.end(JSON.stringify(caption_array));
        });  
      });     
  });
// caption: ngoại ngữ
  app.get('/ngoaingu', function(req, res) {
    res.set({
      'content-type': 'application/json; charset=utf-8'
    });
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        //tìm sách theo caption
          db.collection("book").findOne({"book_store":"nhà sách Nguyễn Văn Cừ"}, function(err, result) {
            if (err) throw err;
              var json = result;
              var i = 0;
              var all_book_array5 = json.all_books;    
              var caption_array = [];
          while(i < all_book_array5.length){
            if(all_book_array5[i].caption == "ngoại ngữ"){
              caption_array.push(all_book_array5[i]);
            }
              i++;
            }
      res.end(JSON.stringify(caption_array));
        });  
      });     
  });

// nhập và hiển thị số sách khách hàng thuê ngẫu nhiên
  app.get('/process_get', function(req, res) {
    res.set({
      'content-type': 'application/json; charset=utf-8'
    });
    var name = req.query.name;
    var num_of_book = req.query.num_of_book;
    var num_of_day = req.query.num_of_day;

    var random_number_array = [];
    var random_book_array = [];

    var all_book_array = json.all_books;
    //-------------------
    if (num_of_book > all_book_array.length) {
        res.end("we dont have enough book for you! sorry!");
        return;
    }
    while (random_number_array.length < num_of_book) {
        var random_number = Math.floor(Math.random() * all_book_array.length);
        if (random_number_array.includes(random_number)) {
          continue;
        }
        console.log(random_number);
        random_number_array.push(random_number);
        random_book_array.push(all_book_array[random_number]);
        console.log(all_book_array[random_number]);
    }
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
        db.collection("customer").insert({
          "Tên khách hàng": name,
          "Số ngày thuê": num_of_day,
          "Tên sách thuê": random_book_array
        });
          console.log(random_book_array);
        });
    res.end(JSON.stringify(random_book_array));
    });
// khách hàng tạo tài khoản
  app.get('/customer_account', function(req, res) {
    res.set({
      'content-type': 'application/json; charset=utf-8'
    });
    var fullname = req.query.fullname;
    var address = req.query.address;
    var username = req.query.username;
    var gender = req.query.gender;
    var pass = req.query.pass;
    var day = req.query.day;
    var month = req.query.month;
    var year = req.query.year;
    var phonenumber = req.query.phonenumber;
    
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log(fullname, gender, address, username, pass);
              db.collection("customer_account").insert({
                "name": fullname,
                "gender": gender,
                "day_of_birth": day,
                "month_of_birth": month,
                "year_of_birth": year,
                "address": address,
                "phone_number": phonenumber,
                "username": username,
                "password": pass
                
          });
          res.end("Successfully!!!");
            });
    });

app.get('/front_end/view/*', function(req, res) {        
   var file_to_send = req.params[0];
   res.sendFile(__dirname + "/front_end/view/" + file_to_send);
  });

app.get('/front_end/js/*', function(req, res) {
   var file_to_send = req.params[0];
   res.setHeader('content-type', 'text/javascript');
   res.sendFile(__dirname + "/front_end/js/" + file_to_send);
  });

var server = app.listen(8081, function() {
   var host = 'localhost'
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
  });

