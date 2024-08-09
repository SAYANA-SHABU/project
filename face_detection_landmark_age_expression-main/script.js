const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(webCam);

function webCam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.log(error);
    });
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  faceapi.matchDimensions(canvas, { height: video.height, width: video.width });

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();
    
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    const resizedResults = faceapi.resizeResults(detections, {
      height: video.height,
      width: video.width,
    });

    faceapi.draw.drawDetections(canvas, resizedResults);
    faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
    faceapi.draw.drawFaceExpressions(canvas, resizedResults);

    resizedResults.forEach(detection => {
      const age = detection.age;
      const lowerBound = Math.floor(age / 5) * 5;
      const upperBound = lowerBound + 5;
      const ageRange = `${lowerBound}-${upperBound}`;
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: `${ageRange} years old ${detection.gender}`,
      });

      drawBox.draw(canvas);
    });

  }, 100);
});
