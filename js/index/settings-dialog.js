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

async function resetProgressCallback() {
  document
    .querySelector(".reset-container")
    .classList.remove("reset-progress-animation");

	window.setCurrentLevel(1);
	window.setCurrentGold(100);
	window.setExpCountForNextLevel(0);
	window.setLevelStarted(Date.now());

	await window.saveSessionToCloud();
	
	window.setLevelStarted(Date.now()); //NOTE: reset due to network latency after saving

  window.location.reload();
}

function saveNickname(_) {
  clearTimeout(window.updateNicknameTimeout);
  window.updateNicknameTimeout = setTimeout(async () => {
    const inputValue = document.getElementById("nickname").value;

    if (
      !inputValue ||
      "string" !== typeof inputValue ||
      0 === inputValue.trim().length
    ) {
      return;
    }

    const formattedInputValue = inputValue.trim();

    if (formattedInputValue.length > 12) {
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(formattedInputValue)) {
      return;
    }

    console.info(`Saving nickname ${formattedInputValue}...`);

    let response;
    try {
      response = await fetch(
        `${window.DB_API_ENDPOINT}/nickname/${window.sessionId}`,
        {
          method: "POST",
          body: JSON.stringify({ value: formattedInputValue }),
        }
      );
    } catch (e) {
      console.error(e);
      return;
    }

    console.info(`Saved nickname ${formattedInputValue}.`);

    window.nickname = formattedInputValue;
    window.localStorage.setItem("nickname", formattedInputValue);
  }, 1000);
}

window.initializeNickname = async () => {
  let response;
  try {
    response = await fetch(
      `${window.DB_API_ENDPOINT}/nickname/${Date.now()}/${
        window.sessionId
      }`
    );
  } catch (reason) {
    console.error(reason);
    return;
  }

  const jsonResponse = await response.json();

  if (!Array.isArray(jsonResponse) || !jsonResponse.length) {
    return;
  }

  const { value: nickname } = jsonResponse[0];

  window.nickname = nickname;
  window.localStorage.setItem("nickname", nickname);

  document.getElementById("nickname").value = window.nickname = nickname;

  console.info(`Welcome back ${nickname}.`);
};

window.toggleFullScreenFromSettings = () => {
	const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
	const isOnHomepage = window.matchMedia('(display-mode: fullscreen)').matches;
	
	isInstalled || isOnHomepage ? document.exitFullscreen() : document.body.requestFullscreen();

	setTimeout(() => {
		document.getElementById("settings-dialog").close();
		document.getElementById("settings-dialog").showModal();
	}, 100);
};

const _saveCurrentSession = async () => {
  if (
    window.shareSessionContainerElement.classList.contains("is-sharing-session")
  ) {
    return;
  }

  window.shareSessionContainerElement.classList.add("is-sharing-session");
  window.shareSessionStatusElement.innerHTML = "<span>Sharing...</span>";

  let fileLocation;
  try {
    fileLocation = await window.saveSessionToCloud();
  } catch (_) {
    window.shareSessionContainerElement.classList.remove("is-sharing-session");
    window.shareSessionStatusElement.innerHTML =
      '<span class="session-saving-error">Failed.</span>';
    return;
  }

  window.shareSessionStatusElement.innerHTML =
    '<span class="session-saving-success">Copied link.</span>';
  window.shareSessionContainerElement.classList.remove("is-sharing-session");

  navigator.clipboard.writeText(
    `${window.location.origin + window.location.pathname}?session-id=${
      window.sessionId
    }`
  );
};

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

  document.getElementById("nickname").addEventListener("keyup", saveNickname);

  window.shareSessionContainerElement =
    document.getElementById("share-session");
  window.shareSessionStatusElement = document.getElementById(
    "share-session-status"
  );

  window.shareSessionContainerElement.addEventListener(
    "click",
    async (event) => {
      event.preventDefault();
      await _saveCurrentSession();
    }
  );
});
