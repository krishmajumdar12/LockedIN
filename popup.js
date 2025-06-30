document.getElementById("focusBtn").addEventListener("click", () => {
    // Set global focusMode flag
    chrome.storage.sync.set({ focusMode: true }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startFocus" }, (response) => {
          document.getElementById("status").textContent = response?.status || "Focus mode triggered.";
        });
      });
    });
  });

  document.getElementById("stopFocusBtn").addEventListener("click", () => {
    chrome.storage.sync.set({ focusMode: false }, () => {
      document.getElementById("status").textContent = "Focus mode turned off.";
    });
  });