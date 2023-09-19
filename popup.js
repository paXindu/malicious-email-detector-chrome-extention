function scanEmail() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["contentScript.js"],
    }, function () {
      chrome.tabs.sendMessage(tabs[0].id, { action: "scanEmail" });
    });
  });
}

function readURLs() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["readURLScript.js"],
    }, function (result) {
      const urlList = result[0].result;
      console.log(urlList);

      if (urlList.length === 0) {
        document.getElementById("serverResponse").innerText = "No URLs to process.";
        return;
      }

      // Send the urlList to the server
      fetch('http://127.0.0.1:5000/predict/phishing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urls: urlList })
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          const goodCount = data.predictions.filter(prediction => prediction === 'good').length;
          const total = data.predictions.length;
          const emailSafetyPercentage = (goodCount / total) * 100;

          if (isNaN(emailSafetyPercentage)) {
            document.getElementById("serverResponse").innerText = "No URLs to process.";
          } else {
            document.getElementById("serverResponse").innerText = `Email Safety Percentage: ${emailSafetyPercentage.toFixed(2)}%`;
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("scanEmailButton").addEventListener("click", scanEmail);
  document.getElementById("readURLButton").addEventListener("click", readURLs);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "emailScanned") {
    const emailData = request.data;

    fetch('http://127.0.0.1:5000/predict/spam', {
      method: 'POST',
      body: emailData
    })
      .then(response => response.json())
      .then(data => {
        const prediction = data.prediction;
        const predictionPercentage = data.prediction_percentage;

        document.getElementById("output").innerText = `Prediction: ${prediction}\nPrediction Percentage: ${predictionPercentage}%`;
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
});
