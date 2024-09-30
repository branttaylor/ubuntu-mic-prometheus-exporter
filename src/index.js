const express = require('express');
const { Gauge } = require('prom-client');
const { execSync } = require('child_process');

const app = express();
const PORT = 8000;

// Define the Prometheus metric
const volumeMetric = new Gauge({
  name: 'audio_volume_level',
  help: 'Volume level of the recorded audio',
});

// Function to record audio and get the volume
const recordAudioAndGetVolume = () => {
  // Record 5 seconds of audio
  execSync('arecord -f cd -d 5 test.wav');

  // Get the audio statistics using sox
  const soxOutput = execSync('sox test.wav -n stat 2>&1');
  
  // Parse the RMS value from the output
  const lines = soxOutput.toString().split('\n');
  for (const line of lines) {
    if (line.includes('RMS')) {
      const rmsValue = parseFloat(line.split(':')[1].trim());
      return rmsValue;
    }
  }
  return 0.0; // Return 0 if RMS value is not found
};

// Start the Express server for metrics
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(volumeMetric.metrics());
});

// Start recording and updating metrics every 30 seconds
setInterval(() => {
  const volumeLevel = recordAudioAndGetVolume();
  volumeMetric.set(volumeLevel);
}, 30000);

// Start the server
app.listen(PORT, () => {
  console.log(`Audio exporter listening on http://localhost:${PORT}/metrics`);
});
