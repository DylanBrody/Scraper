const https = require('https');
const fs = require('fs');


const MAX_RETRIES = 3;
let retryCount = 0;

let index = 1; // Initial value for index
let counter = 1; // Initial value for counter
let dataArray = []; // Initialize an empty array to store JSON data
const mgkey = `stylename@generic~SESSION@6d7de91f-751a-4655-bfee-2e98cc8c937e`;
let doCollect = false;

function makeRequest() {
    index++;
    counter += 2;
    const options = {
        method: 'POST',
        hostname: 'demogamesfree.pragmaticplay.net',
        path: `/gs2c/v3/gameService?action=${doCollect?'doCollect':'doSpin'}&symbol=vs5joker${doCollect?'':'&c=0.01&l=5'}&index=${index}&counter=${counter}&repeat=0&mgckey=${mgkey}`,
        timeout: 1000,
    };
    const req = https.request(options, res => {
        const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
        console.log('Status Code:', res.statusCode);
        console.log('Date in Response header:', headerDate);

        res.on('data', resData => {    
            console.log("resData are ", resData.toString())
            dataArray.push(resData.toString());
            let twAmount = 0;
            if(doCollect) {
                doCollect = false;
            }else{
                const tw = splitData = resData.toString().split('&')[0];
                twAmount = Number(tw.split('=')[1]);
            }
            if (dataArray.length === 5004) {
                jsonFormat();
            } else {
                if(twAmount > 0) doCollect = true;
                makeRequest();
            }
        });

    });

    req.on('error', err => {
        if (err.code === 'ECONNRESET' && retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying request (${retryCount}/${MAX_RETRIES})...`);
            makeRequest(); // Retry the request
        } else {
            console.log('Error:', err.message);
        }
    });

    req.end();
}

function jsonFormat() {

    // console.log("data is " , dataArray)
    let data = dataArray.join('\n');
    // for (let i = 0; i < dataArray.length; i++) {
    //     const keyValuePairs = dataArray[i].split('&');
    //     let object = {};
    //     keyValuePairs.forEach(pair => {
    //         const [key, value] = pair.split('=');
    //         object[key] = value;
    //     });       
    //     data.push(object);
        
    // }
    //const jsonData = JSON.stringify(data);
    const filePath = 'data.txt';
    fs.writeFile(filePath, data, (err) => {
        if (err) {
            console.error('Error saving JSON file:', err);
        } else {
            console.log('JSON file saved successfully!');
        }
    });

}

makeRequest(); // Initial request