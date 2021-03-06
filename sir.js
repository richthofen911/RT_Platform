var request = require('request');
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function checkPromptFlag(cmd){
    if(cmd != "q")
        sendCommand(cmd);
    else{
        rl.close();
        process.exit();
    }
}

function sendCommand(cmdRaw) {
    request('http://104.167.102.201:2333?cmd=' + cmdRaw, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            rl.question("Sir: ", function (command) {
                checkPromptFlag(command);
            });
        }
    });

}

rl.question("Sir: ", function (command) {
    checkPromptFlag(command);
});
