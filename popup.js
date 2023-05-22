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

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("scanEmailButton").addEventListener("click", scanEmail);
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
        document.getElementById("output").innerText = JSON.stringify(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
});
