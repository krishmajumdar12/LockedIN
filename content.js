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
      backgroundColor: "rgba(0, 0, 0, 0.85)",
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
  chrome.storage.sync.get("focusMode", function (data) {
    if (data.focusMode === true) {
      injectFocusOverlay();
    }
  });
  
  // Also respond to popup button press
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "startFocus") {
      injectFocusOverlay();
      sendResponse({ status: "Focus mode overlay injected." });
    }
  });
  