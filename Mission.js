module.exports = exports = function (MID, QID, id, name, picurl) {
    

    var status = "ok";
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
        path: '/FBBOT/api/AssignMission',
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
        });
    });


    // 7
    reqPost.write(MissionDeatils);
    reqPost.end();
    reqPost.on('error', function (e) {
        console.error(e);
    });


    return status;

};