var express = require("express");
var handlebars = require("handlebars");
var cons = require("consolidate"); // template engine consolidation library
var http = require("http");
var fs = require('fs');
var path = require('path');
var nodemailer = require("nodemailer");
var mail = nodemailer.mail;
// create reusable transport method (opens pool of SES connections)
var sesTransport = nodemailer.createTransport("SES", {
    AWSAccessKeyID: process.env.AWS_KEY_ID,
    AWSSecretKey: process.env.AWS_SECRET_KEY
});

var app = express();

app.configure(function(){
    app.set("view engine", "html");
    app.set("view options", { layout: false });
    app.set("views", __dirname + "/views");
    app.engine("html", cons.handlebars);
    app.use(express.static(__dirname + "/public"));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
});

var viewdir = path.join(__dirname, 'views');
fs.readdirSync(viewdir).forEach(function(filename){
    var ext = path.extname(filename);
    if (filename[0] === '_' && ext === '.html'){
        var filepath = path.join(viewdir, filename);
        var stringtemplate = fs.readFileSync(filepath, 'utf8');
        var templatename = path.basename(filename, ext).slice(1);
        handlebars.registerPartial(templatename, stringtemplate);
        //console.log('registering %s partial: %s characters', templatename, stringtemplate.length);
    }
});


app.get('/', function(req, res){
  res.render("index");
});

app.post("/requestForm", function(req, res){
    console.log("======= requestForm ========");
    var name = req.body.name;
    var team = req.body.team;
    var summary = req.body.summary;

    console.log(req.body);

    var mailOptions = {
        from: "request@studiomofo.org <request@studiomofo.org>",
        to: "Studio MoFo <studiomofo@mozillafoundation.org>",
        subject: "[ Request Form ]",
        text: "Requester: " + name + "\n " + "Team: " + team + "\n " + "Summary: " + summary
    }

    sesTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.render("error");
        }else{
            console.log("Message sent: " + response.message);
            res.render("thankyou", { theName: name});
        }
    });
});




app.listen(process.env.PORT, function() {
    console.log("Listening on " + process.env.PORT);
});
