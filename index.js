/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

let util = require('util');
let http = require('http');
let Bot = require('@kikinteractive/kik');
var DOMParser = require('xmldom').DOMParser;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// Configure the bot API endpoint, details for your bot
let bot = new Bot({
    username: 'add2list',
    apiKey: '6412641e-f6e6-4da1-a34b-19ae18a2b929',
    baseUrl: 'https://cryptic-spire-14213.herokuapp.com/',
	staticKeyboard: new Bot.ResponseKeyboard(['Help', 'Get book description'])
});

bot.updateBotConfiguration();

var mysql = require("mysql");

// First you need to create a connection to the db
var con = mysql.createConnection({
    host: "sql12.freemysqlhosting.net",
    user: "sql12174195",
    password: "vJDIEQ5RFF",
	port: 3306,
    database: "sql12174195"
});

con.connect(function (err) {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});

bot.onStartChattingMessage((message) => {
    bot.getUserProfile(message.from)
        .then((user) => {
            message.reply(`Hey ${user.firstName}!`);
			message.reply(`To get a list of all functions type @add2list help`);
        });
});


bot.onLinkMessage((message) => {
    bot.getUserProfile(message.from)
        .then((user) => {
            message.reply(`Hey ${user.firstName}!`);
			message.reply(`To get a list of all functions type @add2list help`);
        });
});


bot.onPictureMessage((message) => {
    bot.getUserProfile(message.from)
        .then((user) => {
            message.reply(`Hey ${user.firstName}!`);
			message.reply(`To get a list of all functions type @add2list help`);
        });
});


bot.onVideoMessage((message) => {
    bot.getUserProfile(message.from)
        .then((user) => {
            message.reply(`Hey ${user.firstName}!`);
			message.reply(`To get a list of all functions type @add2list help`);
        });
});


bot.onScanDataMessage((message) => {
    bot.getUserProfile(message.from)
        .then((user) => {
            message.reply(`Hey ${user.firstName}!`);
			message.reply(`To get a list of all functions type @add2list help`);
        });
});


bot.onStartChattingMessage((message) => {
    bot.getUserProfile(message.from)
        .then((user) => {
            message.reply(`Hey ${user.firstName}!`);
			message.reply(`To get a list of all functions type @add2list help`);
        });
});


bot.onTextMessage((message, next) => {
    if (message.body == 'list' || message.body == 'List')
    {
        if (message.isInPublicChat()) {
            var participants = message.participants;
            var beg = "SELECT * FROM books WHERE ((Mentioned LIKE '%";
            var end = "%'))";
            participants = participants.join("%') OR (Mentioned LIKE '%");
            var query = beg + participants + end;
            var List = [];
            con.query(query, function (err, rows) {

                if (err){
                    message.reply('An error occurred. Try again. Or get in touch at thecoolestbibliophile@gmail.com');
					throw err;
				}
                for (var i = 0; i < rows.length; i++) {
                    var TitleB = rows[i].Title;
                    var uname = rows[i].Mentioned;
                    var Name = (i + 1) + '.' + TitleB + ' Member: ' + uname;
                    List.push(Name);

                }

                var List1 = List.join('\n');
                message.reply(List1);
            });
        } else
        {
            message.reply('This method only works in group chats.');
        }
    }
    next();
});


bot.onTextMessage((message, next) => {
    if (message.body.match('add') || message.body.match('Add'))
    {
        var book = message.body;
        book = book.substring(3);
        var uname = message.from;
        var ISBN, Image, AuthorN, Author, TitleN;
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var grbaseurl = 'http://www.goodreads.com/book/title?format=xml&key=48bnEKgbFotjftWpTKmlA&title=';
        var url = grbaseurl + book;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.send();
 
        xhr.onreadystatechange = processRequest;
 
        function processRequest(e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var respon = xhr.responseText;
                var response = '<?xml version="1.0" encoding="UTF-8"?>\n' + respon + '\n</xml>';
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(response, "text/xml");

                try {
                    ISBN = xmlDoc.getElementsByTagName("isbn")[0].childNodes[0].nodeValue;
                    Image = xmlDoc.getElementsByTagName("image_url")[0].childNodes[0].nodeValue;
                    AuthorN = xmlDoc.getElementsByTagName("name")[0].childNodes[0].nodeValue;
                    TitleN = xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;
                } catch (err) {
                    message.reply('Cannot find ISBN');
                } finally {
                    Image = Image.toString();
                    Author = 'Author: ' + AuthorN.toString();
                    message.reply(Bot.Message.picture(Image));
                    message.reply(Author);

                    con.query('SELECT Mentioned FROM books WHERE ISBN = ?', ISBN, function (err, rows) {

                        if (err){
message.reply('An error occurred. Try again. Or get in touch at thecoolestbibliophile@gmail.com'); 
 throw err;
						}
                        if (rows.length > 0) {
                            var unameAdded = rows[0].Mentioned;
                            // var unameAdded = unameAdded.toString();
                            var unameAdded = JSON.stringify(unameAdded);
                            console.log(unameAdded);
                            var query = "UPDATE books SET Mentioned = CONCAT( Mentioned, ' , ' , '"+uname+"' ) where ISBN = '"+ISBN+"'";
                            con.query(query,
                                    function (err, res) {

                                        if (err){
											message.reply('An error occurred. Try again. Or get in touch at thecoolestbibliophile@gmail.com');
                                            throw err;
										}
                                        console.log('Last insert ID:', res.insertId);
                                    });
                            var reply = 'This book has already been added by ' + unameAdded + ' Your name has been added to the list.';
                            message.reply(reply);
                        } else {

                            con.query('INSERT INTO books SET ?', {Title: TitleN, Mentioned: uname, Author: AuthorN, ISBN: ISBN},
                                    function (err, res) {

                                         if (err){
                    message.reply('An error occurred. Try again. Or get in touch at thecoolestbibliophile@gmail.com');
					throw err;
				}

                                        console.log('Last insert ID:', res.insertId);
                                    });

                        }
                    });


                }

            }
        }


    }

    next();
});


bot.onTextMessage((message, next) => {
    if (message.body.toLowerCase().match('getmylist') || message.body.toLowerCase().match('getlist')) {
        var uname;
        if (message.body.toLowerCase().match('getmylist')) {
            uname = message.from;
        } else if (message.body.toLowerCase().match('getlist')) {
            uname = message.body;
            uname = uname.substring(8);
        }
        var List = [];
        var query = "SELECT Title, Author FROM books WHERE Mentioned LIKE '%" + uname + "%'";
        con.query(query, function (err, rows) {

            if (err){
				message.reply('An error occurred. Try again. Or get in touch at thecoolestbibliophile@gmail.com');
                throw err;
			}
if(rows.length>0){
            for (var i = 0; i < rows.length; i++) {
                var TitleB = rows[i].Title;
                var Author = rows[i].Author;
                var Name = (i + 1) + '.' + TitleB + ' Author: ' + Author;
                List.push(Name);

            }

            var List1 = List.join('\n');
            message.reply(List1);
}
else{
	message.reply('No list found for this user');
}		
	
        });

    }
	
    next();
});



bot.onTextMessage((message, next) => {
    if (message.body.toLowerCase().match('getdetails')) {
        var book = message.body;
        book = book.substring(11);
        var ISBN, Image, AuthorN, TitleN, Description, Rating;
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var grbaseurl = 'http://www.goodreads.com/book/title?format=xml&key=48bnEKgbFotjftWpTKmlA&title=';
        var url = grbaseurl + book;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.send();
 
        xhr.onreadystatechange = processRequest;
 
        function processRequest(e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var respon = xhr.responseText;
                var response = '<?xml version="1.0" encoding="UTF-8"?>\n' + respon + '\n</xml>';
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(response, "text/xml");

                try {
                    ISBN = xmlDoc.getElementsByTagName("isbn")[0].childNodes[0].nodeValue;
                    Image = xmlDoc.getElementsByTagName("image_url")[0].childNodes[0].nodeValue;
                    AuthorN = xmlDoc.getElementsByTagName("name")[0].childNodes[0].nodeValue;
                    TitleN = xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;
                    Description = xmlDoc.getElementsByTagName("description")[0].childNodes[0].nodeValue;
                    Rating = xmlDoc.getElementsByTagName("average_rating")[0].childNodes[0].nodeValue;
                    Image = Image.toString();
                    TitleN = 'Title: ' + TitleN.toString();
                    AuthorN = 'Author: ' + AuthorN.toString();
                    Rating = 'Rating: ' + Rating.toString();
                    Description = 'Description: ' + Description.toString();
                    message.reply(Bot.Message.picture(Image));
                    message.reply(TitleN);
                    message.reply(AuthorN);
                    message.reply(Rating);
                    message.reply(Description);
                } catch (err) {
                    message.reply('Book not found!');

                }
            }
        }

    }
    next();
});

bot.onTextMessage((message, next) => {
    if (message.body.toLowerCase().match('delete')) {
        var uname = message.from;
        var book = message.body.substring(7);

        var ISBN;
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var grbaseurl = 'http://www.goodreads.com/book/title?format=xml&key=48bnEKgbFotjftWpTKmlA&title=';
        var url = grbaseurl + book;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.send();
 
        xhr.onreadystatechange = processRequest;
 
        function processRequest(e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var respon = xhr.responseText;
                var response = '<?xml version="1.0" encoding="UTF-8"?>\n' + respon + '\n</xml>';
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(response, "text/xml");

                try {
                    ISBN = xmlDoc.getElementsByTagName("isbn")[0].childNodes[0].nodeValue;

                    var query = "UPDATE books SET Mentioned = REPLACE(Mentioned, '," + uname + "', '') WHERE ISBN = '" + ISBN + "'";
                    //  console.log(query);
                    con.query(query, function (err, rows) {

                          if (err){
                    message.reply('An error occurred. Try again. Or get in touch at thecoolestbibliophile@gmail.com');
					throw err;
				}

                        if (rows.changedRows) {
                            message.reply('Book deleted!');
                        } else {
                            var query1 = "UPDATE books SET Mentioned = REPLACE(Mentioned, '" + uname + "', '') WHERE ISBN = '" + ISBN + "'";
                            //    console.log(query1);
                            con.query(query1, function (err, rows) {

                                  if (err){
                    message.reply('An error occurred. Try again. Or get in touch at thecoolestbibliophile@gmail.com');
					throw err;
				}

                                if (rows.changedRows) {
                                    message.reply('Book deleted!');
                                } else {

                                    message.reply('Book not found!');
                                }
                            });
                        }
                    });




                } catch (err) {
                    message.reply('Book not found!');
                }
            }
        }



    }
    next();
});

bot.onTextMessage((message, next) => {
    if (message.body.toLowerCase().match('cleanall')) {
        if(message.from === 'queenofwords1' || message.from === 'blonde_angel_reading'|| message.from === 'magadin' ){
        var query1 = 'DELETE FROM books WHERE (Mentioned = "" OR Mentioned = " ,")';
        con.query(query1, function (err, rows) {
              if (err){
                    message.reply('An error occurred. Try again. Or get in touch at thecoolestbibliophile@gmail.com');
					throw err;
				}

            if (rows.affectedRows>0) {
                message.reply('Book deleted!');
            } else {
                message.reply('Nothing to delete.');
            }
            
        
        });
        }
        else{
            message.reply('You do not have permission to delete.');
        }
    
    }
 next();
});


bot.onTextMessage((message, next) => {
	if (message.body.toLowerCase().match('hey'||'hi'||'hello'||'How'||'work'||'why')) {
    bot.getUserProfile(message.from)
        .then((user) => {
            message.reply(`Hey ${user.firstName}!`);
			message.reply(`To get a list of all functions type @add2list help`);
        });
	}
next();
});


bot.onTextMessage((message) => {
    if (message.body.toLowerCase() === 'help') {
        message.reply('You can use any of these funtions:\n 1. @add2list add <bookname> - To add a new book to the List \n 2. @add2list getdetails <bookname> - To get all the details about a book from Goodreads. \n 3. @add2list getmylist - To get a list of all the books you have added \n 4. @add2list getlist <uname> - To get a list of all the books added by a user.');
        //  message.reply('3. @add2list getmylist - To get a list of all the books you have added \n @add2list getlist <uname>');
        message.reply('5. @add2list list - To get a list of all the books that have been added.');
        //   message.reply('5. @add2list getlist <uname> - To get a list of all the books added by a user.');
        message.reply('6. @add2list delete <bookname> - To delete a book you have added from the list.');
        message.reply('7. @add2list cleanall - To delete the books added by users not in the group anymore. Only admins have this permission.');


    }
});


// Set up your server and start listening
let server = http
        .createServer(bot.incoming())
        .listen(process.env.PORT || 3000);