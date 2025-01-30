window.addEventListener("load", async (event) => {
  // Keyboard shortcut event listerners
  document.addEventListener("keydown", (ev) => {
    var key = ev.key; // Detecting keyCode
    // console.log(ev)
    // Detecting Ctrl
    var ctrl = ev.ctrlKey;

    // Detecting meta
    var meta = ev.metaKey;

    // Detecting shift
    var shift = ev.shiftKey;

    if (ev.metaKey && ev.key === "r") {
      ev.preventDefault();
      console.log("prevented refersh");
    }

    if (ev.ctrlKey && ev.key === "r") {
      ev.preventDefault();
      console.log("prevented refersh");
    }

    if (ev.ctrlKey && ev.key === "w") {
      ev.preventDefault();
      console.log("close prevented");
      closeScreen();
    }

    if (ev.metaKey && ev.key === "w") {
      ev.preventDefault();
      console.log("close prevented");
      closeScreen();
    }

    //New File
    if (meta && key === "n") {
      ev.preventDefault();
      newDocument();
    }

    // Open File
    if (ctrl && key === "o") {
      ev.preventDefault();
      openDocument();
    }

    if (meta && key === "o") {
      ev.preventDefault();
      openDocument();
    }

    //Save File
    if (ctrl && key === "s") {
      ev.preventDefault();
      saveDocument();
    }

    if (meta && key === "s") {
      ev.preventDefault();
      saveDocument();
    }

    //Exit App
    if (ctrl && key === "q") {
      ev.preventDefault();
      CloseApplication();
    }

    if (meta && key === "q") {
      ev.preventDefault();
      CloseApplication();
    }

    // for Cut, Copy and Paste for Mac
    if (meta && key === "c") {
      ev.preventDefault();
      CopyMethod();
    }

    if (meta && key === "x") {
      ev.preventDefault();
      CutObject();
    }

    if (ctrl && key === "x") {
      ev.preventDefault();
      CutObject();
    }

    if (meta && key === "v") {
      // ev.preventDefault();
      PasteMethod();
    }

    // for Undo Redo
    if (ctrl && key === "z") {
      ev.preventDefault();
      UndoMethod();
    }

    if (ctrl && shift && key === "z") {
      ev.preventDefault();
      RedoMethod();
    }

    if (meta && key === "z") {
      ev.preventDefault();
      UndoMethod();
    }

    if (meta && shift && key === "z") {
      ev.preventDefault();
      RedoMethod();
    }

    if (key === "Delete") {
      ev.preventDefault();
      DeleteMethod();
    }

    //Group - UnGroup

    if (ctrl && key === "g") {
      ev.preventDefault();
      GroupMethod();
    }

    if (meta && key === "g") {
      ev.preventDefault();
      GroupMethod();
    }

    if (ctrl && shift && key === "G") {
      ev.preventDefault();
      UngroupMethod();
    }

    if (shift && meta && key === "g") {
      ev.preventDefault();
      UngroupMethod();
    }

    //Send Up/Down | Top/Bottom
    if (ctrl && key === "]") {
      ev.preventDefault();
      BringForwardMethod();
    }

    if (meta && key === "]") {
      ev.preventDefault();
      BringForwardMethod();
    }

    if (ctrl && key === "[") {
      ev.preventDefault();
      SendBackwordMethod();
    }

    if (meta && key === "[") {
      ev.preventDefault();
      SendBackwordMethod();
    }

    if (shift && ctrl && key === "]") {
      ev.preventDefault();
      BringToFront();
    }

    if (shift && meta && key === "]") {
      ev.preventDefault();
      BringToFront();
    }

    if (shift && ctrl && key === "[") {
      ev.preventDefault();
      SendToBackMethod();
    }

    if (shift && meta && key === "[") {
      ev.preventDefault();
      SendToBackMethod();
    }
  });

  let userDetails = window.electronAPI.getUserDetails();

  // const id = document.getElementById("lblRegID");
  const name = document.getElementById("lblUserName");
  const email = document.getElementById("lblEmail");
  const contact = document.getElementById("lblContact");
  const licStatus = document.getElementById("lblStatus");
  const package = document.getElementById("lblPackageName");
  const subStartTtl = document.getElementById("lblSubscriptionttl");
  const subStartOn = document.getElementById("lblSubscriptionOn");
  const subEndTtl = document.getElementById("lblSubscriptionEndttl");
  const subEndOn = document.getElementById("lblSubscriptionEndOn");

  // id.innerText = userDetails.id || "N/A";
  name.innerText = userDetails.name;
  email.innerText = userDetails.email;
  contact.innerText = userDetails.contact || "9876543210";
  licStatus.innerText = userDetails.plan === "Free" ? "Trial" : "Activated";

  if (userDetails.plan === "Free") {
    licStatus.style.color = "Red";
    package.innerText = "Trial";

    subStartTtl.innerHTML = "Trial Start On";
    const trialStartDate = new Date(userDetails.trialStartDate);
    subStartOn.innerHTML = `${trialStartDate.toDateString()}`;

    subEndTtl.innerHTML = "Trial End On";
    const trialEndDate = new Date(userDetails.trialEndDate);
    subEndOn.innerHTML = `${trialEndDate.toDateString()}`;
  } else {
    package.innerText = userDetails.package;
  }

  if (userDetails.plan === "Paid") {
    licStatus.style.color = "Green";

    if (userDetails.subscriptionAt) {
      // const subStartDate = new Date(userDetails.subscriptionAt);
      subStartOn.innerHTML = `${userDetails.subscriptionAt}`;
    } else {
      subStartOn.innerHTML = "N/A";
    }

    if (userDetails.subscriptionEnd) {
      const subEndDate = new Date(userDetails.subscriptionEnd);
      subEndOn.innerHTML = `${subEndDate.toDateString()}`;
    } else {
      subEndOn.innerHTML = "N/A";
    }

    if (userDetails.isLifetimeUser === true) {
      subEndOn.innerHTML = "N/A";
    }
  }

  // subOn.innerText = userDetails.subscriptionAt || "N/A";

  var platform = "Not known";
  if (navigator.userAgent.indexOf("Win") != -1) platform = "Windows";
  if (navigator.userAgent.indexOf("Mac") != -1) platform = "MacOS";
  if (navigator.userAgent.indexOf("X11") != -1) platform = "UNIX OS";
  if (navigator.userAgent.indexOf("Linux") != -1) platform = "Linux OS";

  // Check if Trial
  isTrial = window.electronAPI.checkIfTrial();

  if (isTrial) {
    const featchData = await fetch(
      "./Customs/fabric/trial-font-data.json"
    ).then((res) => {
      return res.json();
    });

    const formattedData = featchData.map((item) => ({
      FontName: item.FontName,
      fData: item.fData,
      weight: item.weight,
      language: item.language,
      category: item.category,
      isFeatured: item.isFeatured,
      isFavourite: false,
    }));

    await loadSVGFonts(formattedData);
  }

  if (userDetails.plan === "Paid") {
    //check if LocalStore has fonts
    let fontObjects = window.electronAPI.getStoredFonts();

    if (!fontObjects) {
      let fontData;

      // Get Fonts from web via API
      await getFonts(userDetails.id)
        .then((data) => (fontData = data))
        .catch((error) => console.log(error));

      const tempformattedData = fontData.map((item) => ({
        FontName: item.FontName,
        fData: item.fontObject,
        weight: item.weight,
        language: item.language,
        category: item.category,
        isFeatured: item.isFeatured,
        isFavourite: false,
      }));

      // Format font data for required functions
      const processItems = async (arrayOfItems) => {
        const asyncResults = [];

        for (const item of arrayOfItems) {
          try {
            let fData = await window.electronAPI.runCipherData(
              item.fontObject,
              "deDee34Oemae124maEku@$#keCeCunauTaUhuhere"
            );

            let fItem = {
              FontName: item.name,
              fData: fData,
              weight: item.weight,
              language: item.language.name,
              category: item.category.name,
              isFeatured: item.isFeatured,
              isFavourite: false,
            };

            asyncResults.push(fItem);
          } catch (error) {
            console.error("An error occurred:", error);
          }
        }

        return asyncResults;
      };

      let formattedData = await processItems(fontData);

      // Store fonts in Local Store
      window.electronAPI.setStoreFonts(formattedData);

      // Load fonts in Documents
      await loadSVGFonts(tempformattedData);
    } else {
      // Load fonts in Documents

      const reProcessItems = async (arrayOfItems) => {
        const asyncResults = [];

        for (const item of arrayOfItems) {
          try {
            let fData = await window.electronAPI.runDeCipherData(
              item.fData.encryptedData,
              item.fData.iv,
              item.fData.salt,
              "deDee34Oemae124maEku@$#keCeCunauTaUhuhere"
            );

            let fItem = {
              FontName: item.FontName,
              fData: fData,
              weight: item.weight,
              language: item.language,
              category: item.category,
              isFeatured: item.isFeatured,
              isFavourite: item.isFavourite,
            };

            asyncResults.push(fItem);
          } catch (error) {
            console.error("An error occurred:", error);
          }
        }

        return asyncResults;
      };

      let formattedData = await reProcessItems(fontObjects);

      await loadSVGFonts(formattedData);
    }
  }
});

const loadTrialFonts = async (data) => {
  const formattedData = data.map((item) => ({
    FontName: item.FontName,
    fData: item.fData,
    weight: item.weight,
    language: item.language,
    category: item.category,
    isFeatured: item.isFeatured,
    isFavourite: false,
  }));

  // window.electronAPI.setStoreFonts(formattedData);
  await loadSVGFonts(formattedData);
};

document.addEventListener("DOMContentLoaded", async () => {
  let filepathfor = await window.electronAPI.openPreFilePath();

  if (filepathfor) {
    openDirectfile(filepathfor);
  }

  const JPGLink = document.getElementById("export-JPG-link");
  const PNGLink = document.getElementById("export-PNG-link");
  const PDFLink = document.getElementById("export-PDF-link");
  const SVGLink = document.getElementById("export-SVG-link");

  isTrial = window.electronAPI.checkIfTrial();

  if (isTrial) {
    JPGLink.innerHTML =
      '<a href="javascript:;" onclick="ExportJPG()">JPG <span style="display: flex; align-items: center; color: #e4a111; gap: 3px;" class="pull-right "><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="" style="padding-bottom: 2px;"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg> Pro</span style="display: flex; align-items: center; color: #0e348c;"></a>';
    PNGLink.innerHTML =
      '<a href="javascript:;" onclick="ExportPNG()">PNG <span style="display: flex; align-items: center; color: #e4a111; gap: 3px;" class="pull-right "><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="" style="padding-bottom: 2px;"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg> Pro</span style="display: flex; align-items: center; color: #0e348c;"></a>';
    PDFLink.innerHTML =
      '<a href="javascript:;" onclick="ExportPDF()">PDF <span style="display: flex; align-items: center; color: #e4a111; gap: 3px;" class="pull-right "><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="" style="padding-bottom: 2px;"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg> Pro</span style="display: flex; align-items: center; color: #0e348c;"></a>';
    SVGLink.innerHTML =
      '<a href="javascript:;" onclick="ExportSVG()">SVG <span style="display: flex; align-items: center; color: #e4a111; gap: 3px;" class="pull-right "><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="" style="padding-bottom: 2px;"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg> Pro</span style="display: flex; align-items: center; color: #0e348c;"></a>';
  }

  // Update shortcut key text according OS

  const newDocKey = document.getElementById("new-doc-key");
  const openDocKey = document.getElementById("open-doc-key");
  const saveDocKey = document.getElementById("save-doc-key");
  const saveAsDocKey = document.getElementById("saveAs-doc-key");
  const closeDocKey = document.getElementById("close-doc-key");
  const closeAppKey = document.getElementById("close-app-key");

  const undoKey = document.getElementById("undo-key");
  const redoKey = document.getElementById("redo-key");
  const cutKey = document.getElementById("cut-key");
  const copyKey = document.getElementById("copy-key");
  const pasteKey = document.getElementById("paste-key");
  const delKey = document.getElementById("del-key");
  const groupKey = document.getElementById("group-key");
  const unGroupKey = document.getElementById("ungroup-key");
  const lockKey = document.getElementById("lock-key");
  const unLockKey = document.getElementById("unlock-key");
  const sendUpKey = document.getElementById("send-up-key");
  const sendDownKey = document.getElementById("send-down-key");
  const sendTopKey = document.getElementById("send-top-key");
  const sendBottomKey = document.getElementById("send-bottom-key");

  const undoKey1 = document.getElementById("undo-key1");
  const redoKey1 = document.getElementById("redo-key1");
  const cutKey1 = document.getElementById("cut-key1");
  const copyKey1 = document.getElementById("copy-key1");
  const pasteKey1 = document.getElementById("paste-key1");
  const delKey1 = document.getElementById("del-key1");
  const groupKey1 = document.getElementById("group-key1");
  const unGroupKey1 = document.getElementById("ungroup-key1");
  const lockKey1 = document.getElementById("lock-key1");
  const unLockKey1 = document.getElementById("unlock-key1");
  const sendUpKey1 = document.getElementById("send-up-key1");
  const sendDownKey1 = document.getElementById("send-down-key1");
  const sendTopKey1 = document.getElementById("send-top-key1");
  const sendBottomKey1 = document.getElementById("send-bottom-key1");

  if (navigator.userAgent.indexOf("Mac") != -1) {
    newDocKey.innerHTML = "Cmd+N";
    openDocKey.innerHTML = "Cmd+O";
    saveDocKey.innerHTML = "Cmd+S";
    saveAsDocKey.innerHTML = "Shift+Cmd+S";
    closeDocKey.innerHTML = "Cmd+W";
    closeAppKey.innerHTML = "Cmd+Q";

    undoKey.innerHTML = "Cmd+Z";
    redoKey.innerHTML = "Shift+Cmd+Z";
    cutKey.innerHTML = "Cmd+X";
    copyKey.innerHTML = "Cmd+C";
    pasteKey.innerHTML = "Cmd+V";
    delKey.innerHTML = "fn+Del";
    groupKey.innerHTML = "Cmd+G";
    unGroupKey.innerHTML = "Shift+Cmd+G";
    lockKey.innerHTML = "Cmd+L";
    unLockKey.innerHTML = "Shift+Cmd+L";
    sendUpKey.innerHTML = "Cmd+]";
    sendDownKey.innerHTML = "Cmd+[";
    sendTopKey.innerHTML = "Shift+Cmd+]";
    sendBottomKey.innerHTML = "Shift+Cmd+[";

    undoKey1.innerHTML = "Cmd+Z";
    redoKey1.innerHTML = "Shift+Cmd+Z";
    cutKey1.innerHTML = "Cmd+X";
    copyKey1.innerHTML = "Cmd+C";
    pasteKey1.innerHTML = "Cmd+V";
    delKey1.innerHTML = "fn+Del";
    groupKey1.innerHTML = "Cmd+G";
    unGroupKey1.innerHTML = "Shift+Cmd+G";
    lockKey1.innerHTML = "Cmd+L";
    unLockKey1.innerHTML = "Shift+Cmd+L";
    sendUpKey1.innerHTML = "Cmd+]";
    sendDownKey1.innerHTML = "Cmd+[";
    sendTopKey1.innerHTML = "Shift+Cmd+]";
    sendBottomKey1.innerHTML = "Shift+Cmd+[";
  }
});

const getFonts = async (userId) => {
  const webUrl = window.electronAPI.getWebUrl();
  const url = `${webUrl}/api/fonts/download/${userId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.json();
  } catch (error) {
    return error;
  }
};

const downloadFonts = async () => {
  const Store = require("electron-store");

  const store = new Store();

  const userData = store.get("userDetails");

  let fontData;

  await getFonts(userData.id)
    .then((data) => (fontData = data))
    .catch((error) => console.log(error));

  store.set("fontObjects", fontData);
};

const openOffer = () => {
  window.location.href = "offer.html";
};

const signOut = async () => {
  if (confirm("Do you want to Log out?") === true) {
    window.electronAPI.signOutUser();
    let userDetails = window.electronAPI.getUserDetails();

    let data = {
      userId: userDetails.id,
      sessionId: userDetails.sessionId,
    };

    const webUrl = window.electronAPI.getWebUrl();

    const updateSession = async () => {
      const url = `${webUrl}/api/users/logout/${userDetails.id}`;

      try {
        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify(data),
        });

        return response.json();
      } catch (error) {
        return error;
      }
    };

    await updateSession()
      .then((data) => console.log("Session updated"))
      .catch((error) => console.log(error));

    // window.electronAPI.showLoginWindow();
    window.electronAPI.closeApplication();
  } else {
    return;
  }
  // }
};

async function copyToExternal() {
  var activeObj = canvas.getActiveObject();

  isTrial = window.electronAPI.checkIfTrial();

  if (!isTrial) {
    if (activeObj) {
      if (activeObj.type === "image") {
        return;
      }

      var data = activeObj.toSVG();

      let svgString = `
      <?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${activeObj.height} ${activeObj.width}">
        ${data}
      </svg>
      `;

      navigator.clipboard.writeText(svgString);
      SuccessToastr("Object copied to clipboard!");
    }
  } else {
    const userRes = await window.electronAPI.openPaidDialog();
    if (userRes === 0) {
      openLink("indiafont.com/product/indiafont-v4-pro/?ref=v4");
    } else {
      return;
    }
  }
}

const gotoDashboard = () => {
  window.electronAPI.goToDashboard();
};

const openLink = (url) => {
  window.electronAPI.openExternalLink(`https://${url}`);
};

const changeZoom = (state) => {
  window.electronAPI.zoomSetting(state);
};

const getUserDetails = async (userId) => {
  const webUrl = window.electronAPI.getWebUrl();
  const url = `${webUrl}/api/users/${userId}`;
  // const url = `http://localhost:3000/api/users/${userId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.json();
  } catch (error) {
    return error;
  }
};

const checkUserDetails = async () => {

  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12, // Hours (12 PM)
    0, // Minutes
    0 // Seconds
  );

  let timeUntilScheduledTime = scheduledTime - now;
  if (timeUntilScheduledTime < 0) {
    // If the scheduled time has already passed for today, schedule it for tomorrow
    timeUntilScheduledTime += 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  const performTask = async () => {

    const isOnline = await window.electronAPI.checkInternetConnectivity();

    if (!isOnline) {
      const hasToken = window.electronAPI.checkSessionValidity();

      if (!hasToken) {
        // Function to close app
        await window.electronAPI.sessionEndAppClose();
      }
    } else {
      const isValid = await window.electronAPI.checkSessionValidity();

      if (!isValid) {
        // Function to close app
        await window.electronAPI.sessionEndAppClose();
      }

      // Function to check and update userDetails
      let userDetails = window.electronAPI.getUserDetails();

      let updatedUserDetails;

      await getUserDetails(userDetails.id)
        .then(
          (data) =>
            (updatedUserDetails = {
              ...data,
              token: userDetails.token,
              sessionId: userDetails.sessionId,
            })
        )
        .catch((error) => console.log(error));

      window.electronAPI.updateUserDetails(updatedUserDetails);
    }
  };

  setTimeout(function () {
    performTask();
    // Schedule the task again for the next day
    setInterval(performTask, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  }, timeUntilScheduledTime);
};

checkUserDetails();
