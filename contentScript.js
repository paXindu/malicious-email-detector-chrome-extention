var list = document.getElementsByClassName("ii");
var output = "";
for (var i = 0; i < list.length; i++) {
  output += list[i].innerText + "\n";
}

chrome.runtime.sendMessage({ action: "emailScanned", data: output });
