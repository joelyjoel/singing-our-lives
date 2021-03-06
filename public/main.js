const socket = io();



let mediauploads
window.onload = function() {
  showPage(0);


  

  mediauploads = new SingingOurLives.MediaUploads();
  mediauploads.onupdate = updateSendBtnState;

  let recorderIO = new SingingOurLives.RecorderInterface();
  //pass blobs created by RecorderInterface to MediaUploads
  recorderIO.onrecord = blob => {
    mediauploads.add(blob);
  }

  let picker = new SingingOurLives.FilePicker()
  picker.onpick = file => {
    mediauploads.add(file)
  }

  document.getElementById('recorder_wrapper').appendChild(recorderIO.makeHTML());

  document.getElementById("uploads_wrapper")
  .appendChild(mediauploads.makeHTML());

  document.getElementById('picker_wrapper').appendChild(picker.makeHTML())
}



function showPage(pageIndexOrID) {
  // First, check the page exists
  if(typeof pageIndexOrID == 'string'&&!document.getElementById(pageIndexOrID))
    throw `Page does not exist: ${pageIndexOrID}`;

  // Hide all other pages.
  const pages = document.getElementById("pages").children;
  for(let page of pages)
    page.hidden = true;


  if(typeof pageIndexOrID == "string")
    // Open a page using its 'id' attribute.
    document.getElementById(pageIndexOrID).hidden = false;

  else if(typeof pageIndexOrID == "number") {
    // Open a page using a numeric id.
    pages[pageIndexOrID].hidden = false;
  }

  // Scroll to top
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function finishedRecording() {
  // Gather up files.
  let blobs = mediauploads.blobs;
  mediauploads.clear();

  console.log('uploading:', blobs)
  socket.emit('upload', blobs.map(blob => ({
    buffer: blob,
    type: blob.type
  })));

  document.getElementById('lyrics_textarea').value = ''

  // Finally turn to the thank you page.
  showPage('thank_you_page');
  updateSendBtnState()
}

function thankYouForm(e) {
  // prevent page refresh
  e.preventDefault();

  const form = document.getElementById('thank_you_form');
  const lyrics = document.getElementById('lyrics_textarea');

  const feedback = {
    email: form.elements.namedItem("email").value,
    lyrics: lyrics.value,
    comment: form.elements.namedItem("comment").value,
    consent: form.elements.namedItem("consent").value
  }

  socket.emit('formFill', feedback)

  form.hidden = true;
  document.getElementById("thanks_again").hidden = false;
}

function gotoRecordingPage() {
  setup_visualiser();
  showPage('recording_page');
}

function updateSendBtnState() {
  let sendbtn = document.getElementById('send_recordings');
  let n = mediauploads.nChecked
  console.log(n)
  if(n == 1)
    sendbtn.innerText = `Send 1 file & continue...`
  else if(n > 1)
    sendbtn.innerText = `Send ${n} files & continue...`
  else
    sendbtn.innerText = 'Send & continue...';

  let lyrics = document.getElementById('lyrics_textarea')
  let consent = document.getElementById('contributions_consent')
  sendbtn.disabled = !((n > 0 || lyrics.value.length) && consent.checked);
}