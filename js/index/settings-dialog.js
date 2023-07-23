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
	
function saveNickname(_) {
	clearTimeout(window.updateNicknameTimeout);
	window.updateNicknameTimeout = setTimeout(async () => {
		const inputValue = document.getElementById('nickname').value;

		if (!inputValue || 'string' !== typeof inputValue || 0 === inputValue.trim().length) {
			return;
		}

		const formattedInputValue = inputValue.trim();

		if (formattedInputValue.length > 12) {
			return;
		}

		if (!/^[a-zA-Z0-9]+$/.test(formattedInputValue)) {
			return;
		}

		console.info(`Saving ${formattedInputValue}...`);

		const sessionId = window.getSessionId();

		let response;
		try {
			response = await fetch(
				`https://pokemerge-endpoint.vercel.app/api/nickname/${sessionId}`, {
					method: 'POST',
					body: JSON.stringify({value:formattedInputValue})
				}
			);
		} catch (e) {
			console.error(e);
			return;
		}
		
		console.info('Saved', formattedInputValue);

		window.nickname = formattedInputValue;
		window.localStorage.setItem('nickname', formattedInputValue);
	}, 1000);
}

function initializeNickname() {
	document.getElementById('nickname').value = window.localStorage.getItem('nickname') || '';
}

document.addEventListener("imports-loaded", async () => {
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
	
	initializeNickname();
	
  document.getElementById('nickname').addEventListener('keyup', saveNickname);
});
