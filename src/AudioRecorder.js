import React, { useState, useRef } from 'react';
import axios from 'axios';

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunks = useRef([]);
  const [transcript, setTranscript] = useState('');

  
  // Start recording
  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // Specify the format
        recorder.ondataavailable = event => {
          audioChunks.current.push(event.data);
        };
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          uploadAudio(audioBlob); // Send the audio to backend
          audioChunks.current = [];
        };
        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
      })
      .catch(err => {
        console.error('Error accessing the microphone', err);
      });
  };
  

  // Stop recording
  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  // Upload the recorded audio to the backend
  const uploadAudio = (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
  
    axios.post('http://127.0.0.1:5000/submit_leave', formData)
      .then(response => {
        console.log('Response from backend:', response.data);
        setTranscript(response.data.transcript); // Update the state with the transcript
      })
      .catch(err => {
        console.error('Error uploading audio:', err);
      });
  };

  return (
    <div>
      <h1>Audio Recorder</h1>
    <button onClick={startRecording} disabled={recording}>Start Recording</button>
    <button onClick={stopRecording} disabled={!recording}>Stop Recording</button>
    <br />
    <audio src={audioUrl} controls />
    <br />
    <h2>Transcription:</h2>
    <p>{transcript}</p> {/* Display the transcription */}
    </div>
  );
};

export default AudioRecorder;
