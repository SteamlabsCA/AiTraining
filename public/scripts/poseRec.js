// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
// const URL = 'https://teachablemachine.withgoogle.com/models/ElTQ9DWgI/';

let poseArr = [];
let poseSensitivity = 50;

async function initPose() {
	maxPredictions = model.getTotalClasses();
	poseArr = new Array(maxPredictions);
	for (let i = 0; i < maxPredictions; ++i) poseArr[i] = 0;

	// Convenience function to setup a webcam
	const size = 500;
	const flip = true; // whether to flip the webcam
	webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
	await webcam.setup(); // request access to the webcam
	$('#startButton').fadeOut();
	await webcam.play();
	window.requestAnimationFrame(poseLoop);

	// append/get elements to the DOM
	const canvas = document.getElementById('canvas');
	canvas.height = size;
	canvas.width = size;
	ctx = canvas.getContext('2d');
	labelContainer = document.getElementById('label-container');
	for (let i = 0; i < maxPredictions; i++) {
		// and class labels
		$('#label-container').append(`<div class='meter'><p class='label'></p><span class='meter-container'><span><p></p></span></span></div>`);
	}
	$('#webcam-container').hide(() => {
		$('#canvas').fadeIn();
		$('#label-container').fadeIn();
	});
}

async function poseLoop(timestamp) {
	if (!found) {
		webcam.update(); // update the webcam frame
		let foundPrediction = await posePredict();
		if (foundPrediction.foundI || foundPrediction.foundI === 0) poseArr[foundPrediction.foundI]++;
		if (poseArr[foundPrediction.foundI] > poseSensitivity) {
			found = true;
			serialSubmit(foundPrediction.className);
			return;
		}
		window.requestAnimationFrame(poseLoop);
	}
}

async function posePredict() {
	let foundI;
	let className;
	let classPrediction;
	// Prediction #1: run input through posenet
	// estimatePose can take in an image, video or canvas html element
	const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
	// Prediction 2: run input through teachable machine classification model
	const prediction = await model.predict(posenetOutput);

	for (let i = 0; i < maxPredictions; i++) {
		labelContainer.childNodes[i].firstChild.innerHTML = prediction[i].className;
		labelContainer.childNodes[i].childNodes[1].firstChild.style.width = `${Math.floor(prediction[i].probability * 100)}%`;
		labelContainer.childNodes[i].childNodes[1].firstChild.firstChild.innerHTML = `${Math.floor(prediction[i].probability * 100)}%`;

		if (prediction[i].probability.toFixed(2) > 0.99) {
			foundI = i;
			className = prediction[i].className;
		}
	}

	// finally draw the poses
	drawPose(pose);
	return { foundI: foundI, className: className };
}

function drawPose(pose) {
	if (webcam.canvas) {
		ctx.drawImage(webcam.canvas, 0, 0);
		// draw the keypoints and skeleton
		if (pose) {
			const minPartConfidence = 0.5;
			tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
			tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
		}
	}
}
