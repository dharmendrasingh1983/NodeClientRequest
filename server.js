var express = require('express');
var app = express();



app.get('/', function (req, res) {
    res.send('Hello World');
});

var server = app.listen(3000, function () {
    var ser = server.getConnections;
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});


var request = require('request');

const requestEnum = Object.freeze({ 'Logon': 1, 'Transction': 2, 'DataRequst': 3, 'Logoff': 4 });
var currentSessonid, transactionId;

async function postRequest
    (apiheaders, apibody, requestType) {
    return new Promise(sesolve => {
        if (requestType === requestEnum.Logon) apibody = logonJson;
        if (requestType === requestEnum.Transction) {
            apibody = tsRequest;
        }
        if (currentSessonid !== undefined) {
            apiheaders['cookie'] = currentSessonid;
        }
        request.post({
            url: apiUrl,
            json: true,
            headers: apiheaders,
            body: apibody
        },
            function (err, res, json) {
                if (err) {
                    throw err;
                }
                if (res.statusCode === 200) {
                    if (requestType === requestEnum.Logon) {
                        currentSessonid = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : undefined;
                        sesolve({ 'login': 'success' });
                    }
                    else if (requestType === requestEnum.Transction) {
                        if (Object.keys(json).indexOf('result') > 0) {
                            transactionId = json.result.th;
                            sesolve({ 'transaction': 'success' });
                        }
                    }
                    else if (requestType === requestEnum.Logoff) {
                        currentSessonid = undefined;
                    }
                    else {
                        sesolve(json);
                    }
                }
            });
    });
}

const logonJson = { "jsonrpc": "2.0", "id": 1, "method": "login", "params": { "user": "admin", "passwd": "admin" } };
let apiUrl = 'http://192.168.0.111:8080/jsonrpc';
const tsRequest = { "jsonrpc": "2.0", "id": 1, "method": "new_trans", "params": { "db": "running", "mode": "read" } };

(async function () {
    let header = { "accept": "application/json" };
    let resultJson = await postRequest(header, {}, requestEnum.Logon); // first Default 
    let tsResult = await postRequest(header, {}, requestEnum.Transction); // Second Default
    let devicRequestJson = { "jsonrpc": "2.0", "id": 63, "method": "query", "params": { "th": transactionId, "context_node": "/ncs:devices", "xpath_expr": "device", "selection": ["name", "address", "port", "remote-node", "description"], "chunk_size": 20, "initial_offset": 1, "result_as": "string" } };
    let deviceResult = await postRequest(header, devicRequestJson, requestEnum.DataRequst);
    console.log(deviceResult);
}());

