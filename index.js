/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

let util = require('util');
let http = require('http');
let Bot = require('@kikinteractive/kik');
let Goodreads = require('goodreads');
var DOMParser = require('xmldom').DOMParser;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// Configure the bot API endpoint, details for your bot
let bot = new Bot({
    username: 'add2list',
    apiKey: '6412641e-f6e6-4da1-a34b-19ae18a2b929',
    baseUrl: 'http://8144b8cb.ngrok.io'
});

let goodreads = new Goodreads.client({
    'key': '48bnEKgbFotjftWpTKmlA',
    'secret': 'jtzaJi5jiYZ7yCd16LbhwOgtWABPnRSoLyb96DSl5c'
});

bot.updateBotConfiguration();

var mysql = require("mysql");

// First you need to create a connection to the db
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "bookbase"
});

con.connect(function (err) {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});


bot.onTextMessage((message, next) => {
    if (message.body == 'list' || message.body == 'List')
    {
        var List =[];
        con.query('SELECT Title, Mentioned FROM books', function (err, rows) {

            if (err)
                throw err;
            
            for (var i = 0; i < rows.length; i++) {
                var TitleB = rows[i].Title;
                var uname = rows[i].Mentioned;
                var Name = (i+1) + '.' + TitleB + ' Member: ' + uname;
                List.push(Name);
  
            }
            
            var List1 = List.join('\n');
   message.reply(List1);
        });
    }
 next();
});


bot.onTextMessage((message, next) => {
    if (message.body.match('add') || message.body.match('Add'))
    {
        var book = message.body;
        book = book.substring(3);
        var uname = message.from;
        var ISBN, Image, Author;
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var grbaseurl = 'http://www.goodreads.com/book/title?format=xml&key=48bnEKgbFotjftWpTKmlA&title=';
        var url = grbaseurl + book;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.send();
 
        xhr.onreadystatechange = processRequest;
 
        function processRequest(e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var respon = xhr.responseText;
                var response = '<?xml version="1.0" encoding="UTF-8"?>\n' + respon + '\n</xml>';
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(response, "text/xml");

                try {
                    ISBN = xmlDoc.getElementsByTagName("isbn")[0].childNodes[0].nodeValue;
                    Image = xmlDoc.getElementsByTagName("image_url")[0].childNodes[0].nodeValue;
                    Author = xmlDoc.getElementsByTagName("name")[0].childNodes[0].nodeValue;
                } catch (err) {
                    message.reply('Cannot find ISBN');
                } finally {
                    Image = Image.toString();
                    Author = 'Author: ' + Author.toString();
                    message.reply(Bot.Message.picture(Image));
                    message.reply(Author);
                    message.reply('Is this the book you want to add?');

                    con.query('INSERT INTO books SET ?', {Title: book, Mentioned: uname}, function (err, res) {

                        if (err)
                            throw err;

                        console.log('Last insert ID:', res.insertId);
                    });
                    message.reply('Saved');

                    //         bot.send(Bot.Message.picture('http://i.imgur.com/oalyVlU.jpg'),uname);

                }
            }
        }


    }

    next();
});







// Set up your server and start listening
let server = http
        .createServer(bot.incoming())
        .listen(process.env.PORT || 8080);