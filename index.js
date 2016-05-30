
console.log('Example app listening on port 3000!');

var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.send('Facebook Messanger Bot...!');
});

app.get('/sendmessage', function (req, res) {
    res.send('Facebook Messanger Bot...!');
    if (req.query['senderid'] != null) {
        setTimeout(function () {
            sendTextMessage(req.query['senderid'], "Please send us your receipts for last week.");
        }, 500);

        // 2 seconds
        setTimeout(function () {
            sendTextMessage(req.query['senderid'], "Please use the camera button below to send us the receipts.");
        }, 1000);




    }
});


app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'ramesh-12345') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});


var token = "EAAC1ZCjNNrJkBAMiX5k8EpVdvoJqOzrGEiAxInPu3NzGfIxZAsvVRY0l2WJdNM82q4OqNxGUZCDzdB8b46jgeTNs4kkB5ssFrHiM2x75SPrU9O77bwflucy50SOuFutmHexTid4AZCclJZAX3HYyWVXTnR2QLATxcp6g4bllwZB7EZCeX0E8XEc";


//send genrimessage api
function sendgenricmessage(sender, messageData) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}
//for audio replay
function sendGenericMessage(sender, item, type) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Do you like the messenger experience?",
                    "subtitle": "",
                    "buttons": [{
                        "type": "postback",
                        "title": "Yes",
                        "payload": "Thank you for your feedback"
                    }, {
                        "type": "postback",
                        "title": "No",
                        "payload": "Thank you for your feedback"
                    }]
                }]
            }
        }
    };
    sendgenricmessage(sender, messageData);
}


//for image receipts
function sendGenericMessageImage(sender, item, type) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Do you have more receipts?",
                    "subtitle": "",
                    "buttons": [{
                        "type": "postback",
                        "title": "Yes",
                        "payload": "Please use the camera button below to send us the receipts"
                    }, {
                        "type": "postback",
                        "title": "No",
                        "payload": "Thank you!"
                    }]
                }]
            }
        }
    };

    sendgenricmessage(sender, messageData);
}


//for Help 
function sendTextMessageforhelp(sender, item, type) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "If you need help, click on the following link for FAQ, or call..(+91 22 66632500) for assistance.",
                "buttons": [
          {
              "type": "web_url",
              "url": "http://www.nielsen.com/in/en.html",
              "title": "FAQ"
          }
        ]
            }
        }
    };

    sendgenricmessage(sender, messageData);
}


function sendTextMessage(sender, text) {

    messageData = {
        text: text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}
var allSenders = {};
app.post('/webhook/', function (req, res) {
    //console.log(req.body.entry[0]);    
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        senderId = event.sender.id;
        allSenders[senderId] = true;
        console.log(event);

        var sdk = require('facebook-node-sdk');

        var fb = new sdk({
            appId: '200103387049113',
            secret: '4a22d5e072d0877164d03d17f55989f3'
        }).setAccessToken(token);

        var userinforamation = {};
        var username = "";
        fb.api('/' + senderId + '', function (err, data) {
            if (err) {
                console.log(err);
                return;
            }

            if (data) {
                username = data.first_name;
                userinforamation = data;
                if (typeof event.message != 'undefined') {
                    if (!event.message.text) {                   
                        var http = require('http');
                        var BotDeatils = JSON.stringify({
                            'Url': '' + event.message.attachments[0].payload.url + '',
                            'Type': '' + event.message.attachments[0].type + '',
                            'Text': '',
                            'UserName': '' + username + '',
                            'ProfileUrl': '' + data.profile_pic + '',
                            'FBID': '' + senderId + ''
                        });


                        //5
                        var extServeroptionspost = {
                            host: '202.89.107.52',
                            port: '8880',
                            path: '/api/botmesg',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Length': BotDeatils.length
                            }
                        };



                        //6
                        var reqPost = http.request(extServeroptionspost, function (res) {
                            console.log("response statusCode: ", res.statusCode);
                            res.on('data', function (data) {
                                console.log('Posting Result:\n');
                                process.stdout.write(data);
                                console.log('\n\nPOST Operation Completed');
                            });
                        });

                         if(event.message.attachments[0].type != "location")
                         {
                        // 7
                        reqPost.write(BotDeatils);
                        reqPost.end();
                        reqPost.on('error', function (e) {
                            console.error(e);
                        });
                        }

                        //Object.keys(allSenders).forEach(function (senderId) {
                        if (event.message.attachments[0].type == "image") {
                            sendTextMessage(senderId, "Thank you " + username + "!");
                            sendGenericMessageImage(senderId, "", "");
                        }
                        else if (event.message.attachments[0].type == "location") {

                            //var str = event.message.attachments[0].title + "is " + "latitude= " +event.message.attachments[0].payload.lat+" longitude= " +event.message.attachments[0].payload.long;
                            sendTextMessage(senderId, "Thanks for sharing your location");
                        }
                        else {
                            
                            sendTextMessage(senderId, "Thank you " + username + "!");
                            sendGenericMessage(senderId, "", "");

                        }
                        //});
                    }
                }

                if (event.message && event.message.text) {
                    var text = event.message.text;
                    if (text.toLowerCase() == "help") {
                        sendTextMessageforhelp(senderId, "If you need help, click on the following link for FAQ, or call … (phone number) for assistance.");
                    }
                    else {
                        sendTextMessage(senderId, "This app only accepts receipt images. Please send receipts. Thank you!");
                    }
                    // Object.keys(allSenders).forEach(function (senderId) { 
                    // sendTextMessage(senderId, "Text received, echo: " + text.substring(0, 200));
                    // });

                    // Handle a text message from this sender
                }

                if (event.postback) {
                    var posttext = JSON.stringify(event.postback)
                    sendTextMessage(senderId, event.postback.payload, token)
                }

            }
        });






    }
    res.sendStatus(200);
});





app.listen(process.env.PORT || 3000);

