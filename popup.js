const FOCUS_DURATION_MINUTES = 25;


// Helper function to format milliseconds to mm:ss
function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

function updateTimerDisplay(endTime) {
    const timerDisplay = document.getElementById("timerDisplay");
    const startBtn = document.getElementById("focusBtn");
  
    function tick() {
      const timeLeft = endTime - Date.now();
  
      if (timeLeft <= 0) {
        timerDisplay.textContent = "Session ended!";
        chrome.storage.sync.set({ focusMode: false, focusEndTime: null }, () => {
          startBtn.disabled = false;
          document.getElementById("status").textContent = "Ready to focus";
        });
        clearInterval(intervalId);
      } else {
        timerDisplay.textContent = `Time Left: ${formatTime(timeLeft)}`;
        startBtn.disabled = true;
        document.getElementById("status").textContent = "Focus mode triggered";
      }
    }
  
    tick();
    const intervalId = setInterval(tick, 1000);
    return intervalId;
  }
  

  document.getElementById("focusBtn").addEventListener("click", () => {
    const durationMs = FOCUS_DURATION_MINUTES * 60 * 1000;
    const endTime = Date.now() + durationMs;
  
    chrome.storage.sync.set({ focusMode: true, focusEndTime: endTime }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startFocus" }, (response) => {
          document.getElementById("status").textContent = response?.status || "Focus mode triggered.";
        });
      });
  
      // Start timer UI
      if(window.timerIntervalId) clearInterval(window.timerIntervalId);
      window.timerIntervalId = updateTimerDisplay(endTime);
    });
  });
  
  // On popup open
  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["focusMode", "focusEndTime", "blockedWebsites"], (data) => {
      renderWebsiteList(data.blockedWebsites || []);
  
      if (data.focusMode && data.focusEndTime && Date.now() < data.focusEndTime) {
        if(window.timerIntervalId) clearInterval(window.timerIntervalId);
        window.timerIntervalId = updateTimerDisplay(data.focusEndTime);
      } else {
        document.getElementById("timerDisplay").textContent = "";
        document.getElementById("status").textContent = "Ready to focus";
        document.getElementById("focusBtn").disabled = false;
      }
    });
  });

  document.getElementById("addWebsiteBtn").addEventListener("click", () => {
    const input = document.getElementById("websiteInput");
    const website = input.value.trim();
  
    if (website === "") return;
  
    chrome.storage.sync.get({ blockedWebsites: [] }, (data) => {
      const updatedList = [...new Set([...data.blockedWebsites, website])];
  
      chrome.storage.sync.set({ blockedWebsites: updatedList }, () => {
        renderWebsiteList(updatedList);
        input.value = "";
      });
    });
  });
  
  function renderWebsiteList(websites) {
    const container = document.getElementById("websiteList");
    container.innerHTML = "";
  
    websites.forEach((site, index) => {
      const div = document.createElement("div");
      div.className = "website-item";
  
      const siteText = document.createElement("span");
      siteText.textContent = site;
  
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "remove-btn";
      deleteBtn.textContent = "❌";
  
      deleteBtn.addEventListener("click", () => {
        chrome.storage.sync.get({ blockedWebsites: [] }, (data) => {
          const updatedList = data.blockedWebsites.filter(item => item !== site);
          chrome.storage.sync.set({ blockedWebsites: updatedList }, () => {
            renderWebsiteList(updatedList);
          });
        });
      });
  
      div.appendChild(siteText);
      div.appendChild(deleteBtn);
      container.appendChild(div);
    });
  }
  
  
  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["focusMode", "blockedWebsites"], (data) => {
      // Render websites
      renderWebsiteList(data.blockedWebsites || []);
  
      // Set status text
      const statusDiv = document.getElementById("status");
      if (statusDiv) {
        if (data.focusMode === true) {
          statusDiv.textContent = "Focus mode triggered";
        } else {
          statusDiv.textContent = "Ready to focus";
        }
      } else {
        console.error("No #status element found in popup.html");
      }
    });
  });
  
  