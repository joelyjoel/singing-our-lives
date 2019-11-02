import {PlaybackInterface} from "./PlaybackInterface";
import {ImgDisplay} from "./ImgDisplay";


class MediaUploads{
  constructor(){
    this.blobs = [];

    this.makeHTML();

    this.onupload = null;
  }

  makeHTML(){
    //make div body for whole element
    this.mediaUploadsBody = document.createElement('div');
    this.mediaUploadsBody.id = 'media_uploads_body';

    this.heading = document.createElement('h1');
    this.heading.id = 'media_heading';
    this.heading.innerHTML = 'Uploads and Recordings:';

    this.playbacksDiv = document.createElement('div');

    //make a new file button:
    this.uploadFileButton = document.createElement('input');
    this.uploadFileButton.type = 'file';
    this.uploadFileButton.addEventListener('change',() => this.fileUploaded());

    //make an upload button:
    this.sendButton = document.createElement('button');
    this.sendButton.innerText = 'Send files';
    this.sendButton.addEventListener('click', () => this.upload());

    //add buttons and test to main body:
    this.mediaUploadsBody.appendChild(this.heading);
    this.mediaUploadsBody.appendChild(this.uploadFileButton);
    this.mediaUploadsBody.appendChild(this.playbacksDiv);
    this.mediaUploadsBody.appendChild(this.sendButton);


    //return the main body:
    return this.mediaUploadsBody;
  }

  newFile(blob){
    // add the new blob to the array
    this.blobs.push(blob);
    if(blob.type.slice(0,5) == "audio"){
      console.log("it's an audio blob");
      // make a playback interface to display the blob to the user
      let player = new PlaybackInterface(blob, this);
      this.playbacksDiv.appendChild(player.makeHTML());

    } else if (blob.type.slice(0,5) == 'image'){
      console.log('User uploaded image:');
      console.log(blob);
      let imgdisp = new ImgDisplay(blob);
      this.playbacksDiv.appendChild(imgdisp.makeHTML());


    } else {
      console.log("it ain't audio or an image!");
    }
    // this.logBlobs();
  }

  logBlobs(){
    for(let i = 0; i < this.blobs.length; i++){
      console.log(this.blobs[i]);
    }
  }

  fileUploaded(){
    let files = this.uploadFileButton.files;
    for(let i = 0; i < files.length; i++){
      this.newFile(files[i]);
    }
    //clear the <input> after upload:
    this.uploadFileButton.value = "";
    console.log("New Value:");
    console.log(this.uploadFileButton.value);
  }

  upload(){
    //Need to filter these, but I don't understand how
    //the filtering section of RecorderInterface.upload() works
    console.log('Sending Files');
    let blobsToUpload = this.blobs;
    if(this.onupload){
      this.onupload(blobsToUpload);
    }
  }
}

export{MediaUploads}
