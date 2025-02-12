// Initialize PeerJS
const peer = new Peer();

// Get local video element
const localVideo = document.getElementById("local-video");

// Get remote video element
const remoteVideo = document.getElementById("remote-video");

// Media constraints for getUserMedia
const mediaConstraints = {
  video: true,
  audio: true,
};

// Local stream variable
let localStream;

// Peer Connection variable
let peerConnection;

// Call button
const callButton = document.getElementById("callButton");

// Answer button
const answerButton = document.getElementById("answer-button");

// On PeerJS open event
peer.on("open", (peerId) => {
  console.log(`PeerJS ID: ${peerId}`);
});

// On PeerJS error event
peer.on("error", (error) => {
  console.log(`PeerJS Error: ${error}`);
});

// On call button click
callButton.addEventListener("click", () => {
  // Get remote PeerJS ID from input field
  const remotePeerId = document.getElementById("remote-peer-id").value;

  // Create PeerConnection
  createPeerConnection();

  // Get local media stream and attach to local video element
  navigator.mediaDevices
    .getUserMedia(mediaConstraints)
    .then((stream) => {
      // Attach stream to local video element
      localVideo.srcObject = stream;
      localStream = stream;

      // Add local stream to PeerConnection
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      // Create and send offer to remote peer
      return peer.call(remotePeerId, localStream);
    })
    .then(() => {
      console.log("Call sent successfully!");
    })
    .catch((error) => {
      console.log(`getUserMedia() error: ${error}`);
    });
});

// On answer button click
answerButton.addEventListener("click", () => {
  // Answer incoming call
  peer.on("call", (incomingCall) => {
    // Create PeerConnection
    createPeerConnection();

    // Answer incoming call with local media stream
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then((stream) => {
        // Attach stream to local video element
        localVideo.srcObject = stream;
        localStream = stream;

        // Add local stream to PeerConnection
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });

        // Answer incoming call with local stream
        incomingCall.answer(localStream);

        // Set remote video element source to incoming stream
        incomingCall.on("stream", (incomingStream) => {
          remoteVideo.srcObject = incomingStream;
        });
      })
      .catch((error) => {
        console.log(`getUserMedia() error: ${error}`);
      });
  });
});

// Create PeerConnection function
function createPeerConnection() {
  // Initialize PeerConnection
  peerConnection = new RTCPeerConnection();

  // On ICE candidate event
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log(
        `Sending ICE candidate to remote peer: ${JSON.stringify(
          event.candidate
        )}`
      );
      peerConnection.send(JSON.stringify({ ice: event.candidate }));
    }
  };

  // On track event
  peerConnection.ontrack = (event) => {
    console.log("Remote stream received!");
    remoteVideo.srcObject = event.streams[0];
  };
}
