//////////////////////////////////////////////
//Uses Express, a minimalist web-application
//framework, to host html and js files and
//handle socket connections.
//////////////////////////////////////////////


const fs = require('fs');
const path = require('path')
const express = require('express');
const https = require('https');
const extName = require('ext-name');

//SSL Certification:------
const cert = fs.readFileSync('./ssl/singingyourlife_co_uk.crt');
const ca = fs.readFileSync('./ssl/singingyourlife_co_uk.ca-bundle');
const key = fs.readFileSync('./ssl/singingyourlife.co.uk.key');
const http_options = {cert, ca, key};
//-------------------------



const {
  acceptableMediaFileExtensions,
  serv_port,
  https_port,
  outputDir
} = require("./config.js")

const app = express();
// const server = app.listen(serv_port);
const https_server = https.createServer(http_options,app);
app.use(express.static('public'));
https_server.listen(https_port);

//--Start Socket.io:---------------------------------
const socket = require('socket.io');
// const server_io = socket(server);
const server_io = socket(https_server);
server_io.sockets.on('connection', newConnection);

function newConnection(socket){
  //Print the id of each new socket connection:
  console.log('New connection with socket ID ' + socket.id);

  const sessionDirectory = path.resolve(outputDir, socket.id)
  const sessionAudioFiles = [];

  socket.on('formFill', data => {
    console.log("User", socket.id, "submitted feedback", data);

    let filePath = path.resolve(sessionDirectory, "feedback.json");
    let json = JSON.stringify(data,null,2);
    //make a folder to hold the json and, later, the wav file:
    if(!fs.existsSync(sessionDirectory))
      fs.mkdirSync(sessionDirectory);

    //write the json file:
    fs.writeFileSync(filePath, json);
    console.log("Form saved as " + filePath + ".");
  });

  socket.on('audioupload', files => {
    console.log("User", socket.id, "uploaded", files.length, "recordings");

    let n = 1;
    for(let {type, buffer} of files) {
      // Destructure media type string.
      const [MIME, codec] = type.split(";");

      // Find appropriate file extension based on MIME
      const [{ext}] = extName.mime(MIME);

      // If found a file extension and its in the list
      if(ext && acceptableMediaFileExtensions.includes(ext)) {
        let filename = (sessionAudioFiles.length+1) + '.' + ext;
        let filepath = path.resolve(sessionDirectory, filename);
        sessionAudioFiles.push(filepath);

        console.log("Saving", filepath);
        if(!fs.existsSync(sessionDirectory))
          fs.mkdirSync(sessionDirectory);
        fs.writeFile(filepath, buffer, err => {
          if(err)
            console.log("Error saving audio file:", filepath);
          else
            console.log("Successfully saved", filepath);
        })
      } else
        console.log("Unsupported MIME:", MIME, '('+ext+')');
    }
  })


  socket.on('disconnect', () => {
    console.log("User disconnected", socket.id);
  })

}

console.log("Server is running...");
