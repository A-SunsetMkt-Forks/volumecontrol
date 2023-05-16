function listenForEvents() {
  function err(error) {
    console.error(`Volume Control: Error: ${error}`);
  }

  function formatValue(dB) {
    return dB >= 0 ? `+${dB} dB` : `${dB} dB`;
  }

  function setSlider(dB) {
    const slider = document.querySelector("#volume-slider");
    const text = document.querySelector("#volume-text");
    slider.value = dB;
    text.value = formatValue(dB);
  }

  function updateVolumeValue() {
    const slider = document.querySelector("#volume-slider");
    const text = document.querySelector("#volume-text");
    const dB = slider.value;
    text.value = formatValue(dB);
  }

  function getVolume(tabs) {
    browser.tabs.sendMessage(tabs[0].id, { command: "getVolume" })
      .then((message) => {
        setSlider(message.response);
      })
      .catch(err);
  }

  browser.tabs.query({ active: true, currentWindow: true })
    .then(getVolume)
    .catch(err);

  const slider = document.querySelector("#volume-slider");
  slider.addEventListener("input", () => {
    updateVolumeValue();
    const dB = slider.value;
    browser.tabs.query({ active: true, currentWindow: true })
      .then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, { command: "setVolume", dB: dB });
      })
      .catch(err);
  });

  const text = document.querySelector("#volume-text");
  let cursorPosition = 0; // Track cursor position
  
  text.addEventListener("input", () => {
    const dB = text.value.match(/-?\d+/)[0];
    if (!isNaN(dB)) {
      const start = text.selectionStart; // Get current cursor position
      const end = text.selectionEnd;
      slider.value = dB;
      updateVolumeValue();
      browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
          browser.tabs.sendMessage(tabs[0].id, { command: "setVolume", dB: dB });
        })
        .catch(err);
      // Restore cursor position after modifying the input value
      text.setSelectionRange(start, end);
      cursorPosition = start;
    } else {
      // Update cursor position if the input is not a valid number
      text.setSelectionRange(cursorPosition, cursorPosition);
    }
  });

  function getMono(tabs) {
    browser.tabs.sendMessage(tabs[0].id, { command: "getMono" })
      .then((message) => {
        document.querySelector("#mono-checkbox").checked = message.response;
      })
      .catch(err);
  }

  browser.tabs.query({ active: true, currentWindow: true })
    .then(getMono)
    .catch(err);

  document.addEventListener("change", (e) => {
    if (e.target.id === "mono-checkbox") {
      const mono = e.target.checked;
      browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
          browser.tabs.sendMessage(tabs[0].id, { command: "setMono", mono: mono });
        })
        .catch(err);
    }
  });
}

function showError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Volume Control: Error: ${error.message}`);
}

document.addEventListener("DOMContentLoaded", () => {
browser.tabs.query({ active: true, currentWindow: true, audible: true })
.then(function (tabs) {
if (tabs.length !== 0) {
browser.tabs.executeScript({ file: "cs.js" })
.then(listenForEvents)
.catch(showError);
} else {
showError("No audio playing.");
}
})
.catch(showError);
});