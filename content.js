function isBlockedSite(callback) {
    const hostname = window.location.hostname.replace(/^www\./, '');
    chrome.storage.sync.get({ blockedWebsites: [] }, (data) => {
      const blocked = data.blockedWebsites || [];
      const matched = blocked.some(blockedSite => hostname.endsWith(blockedSite));
      callback(matched);
    });
  }
  
// Helper: inject overlay
function injectFocusOverlay() {
    if (document.getElementById("focus-bubble-overlay")) return;
  
    const overlay = document.createElement("div");
    overlay.id = "focus-bubble-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.90)",
      color: "#ffffff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "1.8rem",
      zIndex: "10000",
      textAlign: "center",
      padding: "2rem"
    });
  
    const message = document.createElement("div");
    message.textContent = "Stay Locked In";
    overlay.appendChild(message);
  
    document.body.appendChild(overlay);
  }
  
  // Check focusMode on page load
  chrome.storage.sync.get(["focusMode", "focusEndTime"], function (data) {
    if (data.focusMode === true && Date.now() < data.focusEndTime) {
        isBlockedSite((shouldBlock) => {
          if (shouldBlock) injectFocusOverlay();
        });
      } else {
        // Remove overlay if timer expired
        const existing = document.getElementById("focus-bubble-overlay");
        if (existing) {
            existing.remove();
        }
      }
  });
  
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "startFocus") {
      isBlockedSite((shouldBlock) => {
        if (shouldBlock) injectFocusOverlay();
        sendResponse({ status: "Focus mode overlay injected." });
      });
    }
  });
  