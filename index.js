
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var vision = require('node-cloud-vision-api');
var Mission = require('./Mission.js');
 var Questions = require('./Questions.js');
vision.init({ auth: 'AIzaSyBBd-AhSgjF76rAW0NKy20WeMdxx0dYKec' });
app.use(bodyParser.json());

var token = "EAAHtMZBfegWYBANUaANuR283Qf9VtuwdkgdZBRl1PV96ZB1dgCWchZBthu5XZBbfivTAVMxFj9uhoqQlXPtrhvLdOZAG26kyZCxVAvrNexZBCt8eWfu2kkLwLn0a1ysZBw8TvS9guIGEqaxyMZCA3LO4ZAIEZClabr0rpSRntmmAAzvoAwZDZD";
  var sdk = require('facebook-node-sdk');
        var fb = new sdk({
            appId: '542282165944678',
            secret: 'e9a974c14f2de32ebce9205e813b2f6b'
        }).setAccessToken(token);


        app.get('/', function (req, res) {   
             res.send('Welcome to Facebook Messanger t Bot...!'); 
          });

app.get('/sendmessage', function (req, res) {
    res.send('Facebook Messanger Bot...!');
    if (req.query['senderid'] != null) {
        sendTextMessage(req.query['senderid'], req.query['msg']);
    }
});


app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'ramesh-143') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});

//send sms api
function sendgenricsms(sender, mobilenum) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: {phone_number:""+mobilenum+""},
            message: {text:"hello from valuelabs"}
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
        else{
         console.log('Responce: ', body);
        }
    });
}


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
                    "title": "Does this product have any discount?",
                    "subtitle": "",
                    "buttons": [{
                        "type": "postback",
                        "title": "Yes",
                        "payload": "Please enter discount price.(example: $20)"
                    }, {
                        "type": "postback",
                        "title": "No discount price",
                        "payload": "finishupload"
                    }]
                }]
            }
        }
    };

    sendgenricmessage(sender, messageData);
}



//after location upload.
function sendGenericloc(sender, l, lng) {
 var http = require('http');
    var optionsget = {
        host: '202.89.107.58', // here only the domain name       
        port: '80',
        path: '/BOTAPI/api/AssignMission?latitude=' + l + '&longitude='+lng+'&id=' + sender + '', // the rest of the url with parameters if needed
        method: 'GET' // do GET
    };  
   

   var req = http.request(optionsget, function(res) {

  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);  
      var qdata=chunk;    
         var qobj=JSON.parse(qdata);            
         if(qobj.length>0)
         {
         if(qobj[0].status=="false")
         {
         sendTextMessage(sender, "Thank you! Here are "+qobj.length+" missions that you can choose from. Please click on the one that you would like to complete.");
         }
         }
         else{
          sendTextMessage(sender, "Thank you! No active missions found in you are location");
         }
                for (var list = 0; list < qobj.length; list++) {
               if(qobj[list].status=="false")
               {                
                var messagedata = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "" + qobj[list].Question + "",
                                "subtitle": "",
                                "buttons": [{
                                    "type": "postback",
                                    "title": "select",
                                    "payload": "MID-"+qobj[list].QID+""
                                }]
                            }]
                        }
                    }
                };
                 sendgenricmessage(sender, messagedata);
                } 
                else{
                if(qobj[list].status=="Discount price")
                {
                sendGenericMessageImage(sender,"","");
                }else{                
                 sendTextMessage(sender, qobj[list].status);
                 }
                }              
            }           

  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();

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

//read query string
function getParamValuesByName(querystring,q) {
        var qstring =q.slice(q.indexOf('?') + 1).split('&');
        for (var i = 0; i < qstring.length; i++) {
            var urlparam = qstring[i].split('=');
            if (urlparam[0] == querystring) {
                return urlparam[1];
            }
        }
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
        var userinforamation = {};
        var username = "";       
        fb.api('/' + senderId + '', function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            if (data) {
                username = data.first_name+" "+data.last_name;               
                userinforamation = data;
                if (typeof event.message != 'undefined') {
                    if (!event.message.text) {
                                       
                        var http = require('http');      

                        //Object.keys(allSenders).forEach(function (senderId) {
                        if (event.message.attachments[0].type == "image") {
                         
                          
                        
                        //Google vision api..                  
                            var req = new vision.Request({
  image: new vision.Image({
    url: ''+event.message.attachments[0].payload.url+''
  }),
  features: [   
    new vision.Feature('LABEL_DETECTION', 10),
    new vision.Feature('LOGO_DETECTION', 5),     
    new vision.Feature('TEXT_DETECTION', 10),
  ]
});


// send single request
vision.annotate(req).then((res) => {
  // handling response
  //console.log(JSON.stringify(res.responses));     
  var lblobj=res.responses;  

     
      var str = "";
      var logos="";
      var labelsinfo="";
      var textinfo="";
    if (lblobj[0].hasOwnProperty('logoAnnotations')) {   
    for (var i = 0; i < lblobj[0].logoAnnotations.length; i++) {
       if(i<lblobj[0].logoAnnotations.length-1)
        str = str + " " + lblobj[0].logoAnnotations[i].description + " , ";
        else
        str = str + " " + lblobj[0].logoAnnotations[i].description + "";
    }
   logos=str;
}
    str = "";
    if (lblobj[0].hasOwnProperty('textAnnotations')) {
     
          str = str + " " + lblobj[0].textAnnotations[0].description;
          textinfo=str;      
    }
    str = ""
    if (lblobj[0].hasOwnProperty('labelAnnotations')) {
        for (var i = 0; i < lblobj[0].labelAnnotations.length; i++) {
         if(i<lblobj[0].labelAnnotations.length-1)
            str = str + " " + lblobj[0].labelAnnotations[i].description + " , ";
            else
             str = str + " " + lblobj[0].labelAnnotations[i].description + "";

        }
         labelsinfo=str;
         var botInfo = JSON.stringify({
                            'Url': '' + event.message.attachments[0].payload.url + '',
                            'Type': '' + event.message.attachments[0].type + '',                           
                            'UserName': '' + username + '',
                            'ProfileUrl': '' + data.profile_pic + '',
                            'FBID': '' + senderId + '',
                            'RID': '' + event.recipient.id + '',
                            'Text': '' + textinfo + '',
                            'Logos': '' + logos + '',
                            'Labels': '' + labelsinfo + ''
                        });     
                        
                        
                         //5
                        var extServeroptionspost = {
                            host: '202.89.107.58',
                            port: '80',
                            path: '/BOTAPI/api/botmesg',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Length': botInfo.length
                            }
                        };



                        //6
                        var reqPost = http.request(extServeroptionspost, function (res) {
                            console.log("image res statusCode: ", res.statusCode);
                            res.on('data', function (data) {                                
                                process.stdout.write(data);                                        
                                      var objstr=data.toString("utf8");                                         
                                      if(objstr.indexOf("success+")>-1)    
                                      {          
                                        console.log("entered to nexttask+:");                    
                                        sendTextMessage(senderId,objstr.split("+")[1].replace('"', '').replace('"', ''));  
                                       }
                                       else if(objstr.indexOf("pricetag-")>-1)    
                                      {                
                                       // sendTextMessage(senderId,"Please send the original price of Tide "+objstr.split("-")[1]+" before any discount.");             
                                         sendGenericMessageImage(senderId,"","");
                                       }
                                       else{
                                       sendTextMessage(senderId,data.toString("utf8").replace('"', '').replace('"', ''));  
                                       }                          
                            });
                        });

                       
                        // 7
                        reqPost.write(botInfo);
                        reqPost.end();
                        reqPost.on('error', function (e) {
                            console.error(e);
                        });
                              



    }
}, (e) => {
  console.log('Error: ', e)
   sendTextMessage(senderId,e); 
});

                        }
                        else if (event.message.attachments[0].type == "location") {
                       
                            //var str = event.message.attachments[0].title + "is " + "latitude= " +event.message.attachments[0].payload.lat+" longitude= " +event.message.attachments[0].payload.long;
                         //   sendTextMessage(senderId, "Thank you! Here are three missions that you can choose from. Please click on the one that you would like to complete.");
                          var lat= event.message.attachments[0].payload.coordinates.lat;
                          var longitude= event.message.attachments[0].payload.coordinates.long;
                            sendGenericloc(senderId,lat,longitude);
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
                    else if(text.indexOf("$")>-1)
                    {
                     var stramount = text;
                        var n = stramount.match(/\$(\d+)/);
                                var price=n[1];
                                if(price.length>0)
                        sumbnitdiscountprice(senderId,price,token);
                        else
                        checkmission(senderId,token);

                    }
                    else if (text.indexOf("latitude=")>-1) {
                           //sendTextMessage(senderId, "Thank you! Here are three missions that you can choose from. Please click on the one that you would like to complete.");
                             sendGenericloc(senderId,getParamValuesByName('latitude', text),getParamValuesByName('longitude', text));
                    }
                   else if (text.indexOf("sms=") > -1) {
                        console.log(text.split("=")[1]);
                        sendgenricsms(senderId, text.split("=")[1]);
                    
                    }     
                    else {
                       checkmission(senderId,token);
                    }
                    // Object.keys(allSenders).forEach(function (senderId) { 
                    // sendTextMessage(senderId, "Thank you! Here are three missions that you can choose from. Please click on the one that you would like to complete.");
                    // });

                    // Handle a text message from this sender
                }

                if (event.postback) {
                    var posttext = event.postback.payload;
                    if(posttext=="finishupload")
                    {
                     sumbnitdiscountprice(senderId,"0",token)
                    }                   
                   
                    else if(posttext.indexOf("MID-") > -1)
                    {
                     var newtext=posttext.split("-");
                    var qid="";
                    var mid=newtext[1];                   
                    //assigning mission to user
                      fb.api('/' + senderId + '', function (err, data) {            
                     if (data) {
                     assignmission(mid,qid,senderId,data.first_name+" "+data.last_name,data.profile_pic,token);   
                     }
                     });   

                    }
                    else{
                     sendTextMessage(senderId, posttext, token);
                    }
                    
                }

            }
        });






    }
    res.sendStatus(200);
});





//assign mission
function assignmission(MID,QID,id,name,picurl,token)
{

var http = require('http');
    var MissionDeatils = JSON.stringify({
        'MID': '' + MID + '',
        'QID': '' + QID + '',
        'UID': '' + id + '',
        'Name': '' + name + '',
        'URL': '' + picurl + ''
    });


    //5
    var extServeroptionspost = {
        host: '202.89.107.58',
        port: '80',
        path: '/BOTAPI/api/AssignMission',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': MissionDeatils.length
        }
    };



    //6
    var reqPost = http.request(extServeroptionspost, function (res) {
        console.log("response statusCode: ", res.statusCode);
        res.on('data', function (data) {
            process.stdout.write(data);    
            var status=data.toString("utf8").replace('"', '');
            if(status.indexOf("Thanks! Mission")>-1)
            {
             sendTextMessage(id,status.replace('"', ''),token);  
             sendnexttask(MID,id,token);
            }
            else{
             sendTextMessage(id,status.replace('"', ''),token);   
            }
                         
                 
        });
    });


    // 7
    reqPost.write(MissionDeatils);
    reqPost.end();
    reqPost.on('error', function (e) {
        console.error(e);
    });
}


//after finishing  upload.
function finishupload(sender,token) {
 var http = require('http');
    var optionsget = {
        host: '202.89.107.58', // here only the domain name       
        port: '80',
        path: '/BOTAPI/api/SubmitMission?uid=' + sender + '', // the rest of the url with parameters if needed
        method: 'GET' // do GET
    };  
   

   var req = http.request(optionsget, function(res) {

  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('points: ' + chunk);  
      var qdata=chunk;    
         var qobj=JSON.parse(qdata);               
                for (var list = 0; list < qobj.length; list++) {
                if(qobj[list].status=="completed")
                {
                sendTextMessage(sender,"It looks good. We will process your information and reward you with "+qobj[list].points+" points when our mission center fully confirms that your mission is completed",token);  
                }
                else{
                sendTextMessage(sender,"It seems to me that you probably have missed the price tag. Can you please retake a picture of the price tag along?",token);  
                }
                }
         
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();
}

//sen next task
function sendnexttask(mid,id,tok)
{

 var http = require('http');
    var optionsget = {
        host: '202.89.107.58', // here only the domain name       
        port: '80',
        path: '/BOTAPI/api/assigntask?uid=' + id + '&mid='+mid+'', // the rest of the url with parameters if needed
        method: 'GET' // do GET
    };  
   

   var req = http.request(optionsget, function(res) {

  res.setEncoding('utf8');
  res.on('data', function (chunk) {   
      var qdata=chunk;           
         var qobj=JSON.parse(qdata);  
                      
                if(qobj.length>0)
                {
                if(qobj[0].status=="ok")
                {
                if(mid=="find")
                {                
                sendTextMessage(id,"Thanks for sending the picture. Now please take a picture of the bar code of "+qobj[0].product.replace('"', '')+".",tok);  
                }else{
                 sendTextMessage(id,"Please go to the nearest "+qobj[0].store+", locate the "+qobj[0].product+", and take a picture of "+qobj[0].product.replace('"', '')+".",tok);  
                 }
                 }
                 else{
                  sendTextMessage(id,qobj[0].status,tok);  
                 }
                }
         
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();

}

//sumbit discount price
function sumbnitdiscountprice(id,price,tokens)
{

var http = require('http');
    var optionsget = {
        host: '202.89.107.58', // here only the domain name       
        port: '80',
        path: '/BOTAPI/api/discountprice?uid=' + id + '&price='+price+'', // the rest of the url with parameters if needed
        method: 'GET' // do GET
    };  
   

   var req = http.request(optionsget, function(res) {

  res.setEncoding('utf8');
  res.on('data', function (chunk) {   
      var qdata=chunk; 
      console.log("discount: "+qdata);

         if(qdata.indexOf("pricetag-")>-1)    
             {                
                //  sendTextMessage(id,"Please send the original price of Tide "+qdata.split("-")[1]+" before any discount.");             
                  sendGenericMessageImage(id,"","");
              }
               else{
                    sendTextMessage(id,qdata.toString("utf8").replace('"', '').replace('"', ''));  
                }
         
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();

}


//check active mission 

function checkmission(id,tok)
{

 var http = require('http');
    var optionsget = {
        host: '202.89.107.58', // here only the domain name       
        port: '80',
        path: '/BOTAPI/api/missionstatus?uid=' + id + '', // the rest of the url with parameters if needed
        method: 'GET' // do GET
    };  
   

   var req = http.request(optionsget, function(res) {

  res.setEncoding('utf8');
  res.on('data', function (chunk) {   
      var qdata=chunk;   
       sendTextMessage(id,qdata.replace('"', '').replace('"', ''),tok);   
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();

}


app.listen(process.env.PORT || 3000);

