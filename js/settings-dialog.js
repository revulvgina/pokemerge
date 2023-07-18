function onEnableVibration(event) {
  window.localStorage.setItem(
    "enable-vibration",
    !!document.getElementById("enable-vibration").checked
  );
}

function openSettings() {
  if (null === window.localStorage.getItem("enable-vibration")) {
    window.localStorage.setItem("enable-vibration", true);
  }
  document.getElementById("enable-vibration").checked =
    "true" === window.localStorage.getItem("enable-vibration");
  document.getElementById("settings-dialog").showModal();
}

function onResetProgress() {
  window.location.reload();
}

function closeDialog(dialogId) {
  document.getElementById(dialogId).close();
}

function startResetProgressHold() {
  stopResetProgressHold();
  document
    .querySelector(".reset-container")
    .classList.add("reset-progress-animation");
  window._resetProgressTimeout = setTimeout(resetProgressCallback, 4000);
}

function stopResetProgressHold() {
  document
    .querySelector(".reset-container")
    .classList.remove("reset-progress-animation");
  clearTimeout(window._resetProgressTimeout);
}

function resetProgressCallback() {
  document
    .querySelector(".reset-container")
    .classList.remove("reset-progress-animation");

  window.localStorage.removeItem("current_gold");
  window.localStorage.removeItem("current_lv");
  window.location.reload();
}

document
  .getElementById("reset-progress")
  .addEventListener("mousedown", (event) => {
    event.preventDefault();
    if (1 !== event.which) {
      return;
    }
    startResetProgressHold();
  });

document
  .getElementById("reset-progress")
  .addEventListener("mouseup", (event) => {
    event.preventDefault();
    stopResetProgressHold();
  });

document
  .getElementById("reset-progress")
  .addEventListener("touchstart", (event) => {
    event.preventDefault();
    startResetProgressHold();
  });

document
  .getElementById("reset-progress")
  .addEventListener("touchend", (event) => {
    event.preventDefault();
    stopResetProgressHold();
  });
