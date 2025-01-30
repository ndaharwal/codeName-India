const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  screen,
  webFrame,
  globalShortcut,
} = require("electron");
const path = require("path");
const jwt_decode = require("jwt-decode");
const os = require("os");
const fs = require("fs");
const fsasy = require("fs").promises;
const http = require("http");
const yauzl = require("yauzl");
const ncp = require("ncp").ncp;
const rimraf = require("rimraf");

const SVGtoPDF = require("svg-to-pdfkit");
const PDFDocument = require("pdfkit");

const Store = require("electron-store");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow;
let loginWindow;
let dashWindows;
let converterWindow;
let fontLoadingModal;
let openFilePath;
let isUpdated = false;
let fileContent;
let fileName;

// Disable the default menu options
Menu.setApplicationMenu(null);

const createWindow = () => {
  const store = new Store();
  const mainScreen = screen.getPrimaryDisplay();
  const { width, height } = mainScreen.size;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      webSecurity: true,
      // devTools: true
    },
    minHeight: 730,
    minWidth: 880,
    // devTools: true,
    show: false,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.menuBarVisible = false;
  mainWindow.title = "IndiaFont V4";

  // set Full Screen for Windows systems
  if (process.platform === "win32") {
    mainWindow.maximize();
  }

  const isTrial = store.get("isTrial");

  if (!isTrial) {
    mainWindow.hide();
    createFontLoadingWindow();
  } else {
    mainWindow.show();
  }
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    const hasToken = checkTokenInStore();

    if (hasToken) {
      // check if current session is valid session
      const isValid = await checkSessionValidity();

      if (isValid) {
        createDashWindow();
      } else {
        createLoginWindow();
      }
    } else {
      createLoginWindow();
    }
  }
});

app.on("will-quit", () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

app.whenReady().then(() => {
  const isMac = process.platform === "darwin";

  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [{ role: "about" }, { role: "quit" }],
          },
        ]
      : []),
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Login Related Code

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 960,
    height: 525,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
      // devTools: false
    },
    center: true,
    resizable: false,
    // frame: false,
    webSecurity: true,
  });

  loginWindow.loadFile(path.join(__dirname, "entry/login.html"));
  loginWindow.menuBarVisible = false;
  loginWindow.title = "IndiaFont V4";

  // mainWindow.webContents.openDevTools();

  loginWindow.on("closed", () => {
    return;
  });
}

function createDashWindow() {
  const store = new Store();

  dashWindows = new BrowserWindow({
    width: 960,
    height: 523,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
      // devTools: false
    },
    center: true,
    resizable: false,
    // frame: false,
    webSecurity: true,
  });

  dashWindows.loadFile(path.join(__dirname, "entry/dashboard.html"));
  dashWindows.menuBarVisible = false;
  dashWindows.title = "IndiaFont V4";

  dashWindows.webContents.session.on(
    "will-download",
    (event, item, webContents) => {
      let sourcePath;
      let platform = os.platform();

      if (platform === "darwin") {
        sourcePath = __dirname.split(`app.asar/src`)[0];
      }

      if (platform === "win32") {
        sourcePath = __dirname.split(`app.asar\\src`)[0];
      }

      item.setSavePath(
        path.join(sourcePath, `library/extractedLib/${item.getFilename()}`)
      );

      item.on("done", (event, state) => {
        if (state === "completed") {
          console.log("Download completed successfully");

          const zipFilePath = item.getSavePath();
          const extractFolder = path.join(sourcePath, "extractedLib");
          const copySource = extractFolder;
          const copyDestination = path.join(sourcePath, "library");

          // Create the destination folder if it doesn't exist
          if (!fs.existsSync(extractFolder)) {
            fs.mkdirSync(extractFolder);
          }

          yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipfile) => {
            if (err) throw err;

            zipfile.readEntry();
            zipfile.on("entry", (entry) => {
              if (/\/$/.test(entry.fileName)) {
                // Directory entry, create the directory
                fs.mkdir(
                  path.join(extractFolder, entry.fileName),
                  { recursive: true },
                  (err) => {
                    if (err) throw err;
                    zipfile.readEntry();
                  }
                );
              } else {
                // File entry, extract the file
                zipfile.openReadStream(entry, (err, readStream) => {
                  if (err) throw err;

                  // Ensure parent directory exists
                  const fileDir = path.dirname(
                    path.join(extractFolder, entry.fileName)
                  );
                  if (!fs.existsSync(fileDir)) {
                    fs.mkdirSync(fileDir, { recursive: true });
                  }

                  const writeStream = fs.createWriteStream(
                    path.join(extractFolder, entry.fileName)
                  );
                  readStream.pipe(writeStream);

                  writeStream.on("close", () => {
                    zipfile.readEntry();
                  });
                });
              }
            });

            zipfile.on("end", () => {
              // console.log( "Extraction complete. Destination folder:", extractFolder );

              ncp(copySource, copyDestination, { clobber: true }, (err) => {
                if (err) {
                  console.error("Error copying files:", err);
                } else {
                  // console.log("Files copied to:", copyDestination);
                  store.set("isLibInstalled", true);

                  // // Remove the extracted files
                  // rimraf(extractFolder, (err) => {
                  //   if (err) {
                  //     console.error("Error removing extracted files:", err);
                  //   } else {
                  //     console.log("Extracted files removed:", extractFolder);
                  //   }
                  // });
                }
              });
            });
          });
        }
      });
    }
  );

  dashWindows.on("closed", () => {
    return;
  });
}

function createFontLoadingWindow() {
  fontLoadingModal = new BrowserWindow({
    width: 1080,
    height: 645,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
      // devTools: false
    },
    center: true,
    resizable: false,
    frame: false,
    webSecurity: true,
    // parent: mainWindow,
    // modal: true,
    movable: false,
    transparent: true,
  });

  fontLoadingModal.loadFile(path.join(__dirname, "splash.html"));
  fontLoadingModal.menuBarVisible = false;
  // fontLoadingModal.title = "IndiaFont V4";

  fontLoadingModal.on("closed", () => {
    return;
  });
}

function createTypeConverterWindow() {
  if (converterWindow && !converterWindow.isDestroyed()) {
    converterWindow.show();
  } else {
    converterWindow = new BrowserWindow({
      width: 990,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, "preload.js"),
      },
      center: true,
      resizable: false,
      webSecurity: true,
    });

    converterWindow.loadURL("https://indiafont.in/type-converter/");
    converterWindow.menuBarVisible = false;
    converterWindow.title = "IndiaFont V4";

    converterWindow.on("closed", () => {
      return;
    });
  }
}

app.on("ready", async () => {
  const hasToken = checkTokenInStore();
  const store = new Store();
  const deviceName = os.hostname();

  store.set("deviceName", deviceName);
  store.set("webUrl", "https://v4.indiafont.com");

  if (hasToken) {
    // check if current session is valid session
    const isValid = await checkSessionValidity();

    if (isValid) {
      createDashWindow();
    } else {
      createLoginWindow();
    }
  } else {
    createLoginWindow();
  }

  // registerShortcuts();
});

// Handle the open-file event.
app.on("open-file", async (event, path) => {
  event.preventDefault(); // Prevent Electron from opening the file by default.

  // You can now handle the 'path' to open and process the custom file.
  // For example, you can pass it to your existing file opening function.
  if (path) {
    try {
      openFilePath = path;
    } catch (err) {
      // Handle any errors that may occur during directory reading
      console.error("Error reading file:", err);
      // throw err; // Rethrow the error if needed
    }
  }
});

app.on("before-quit", async (event) => {
  event.preventDefault();
  if (isUpdated) {
    const res = await saveConfirmDialog();

    if (res === 0) {
      await saveIfFile(fileContent, fileName);
      isUpdated = false;
      app.exit();
    } else if (res === 1) {
      app.exit();
    } else {
      return;
    }
  } else {
    app.exit();
  }
});

app.on("quit", async (event) => {
  event.preventDefault();
});

function checkTokenInStore() {
  const store = new Store();
  const token = store.get("authToken");

  if (token) {
    const decodedToken = jwt_decode(token);
    const expiryDate = new Date(decodedToken.exp * 1000).toJSON().slice(0, 10);
    const todaysDate = new Date().toJSON().slice(0, 10);

    if (expiryDate < todaysDate) {
      return false;
    } else {
      return true;
    }
  } else {
    logMessageWithLocation("No Token Found", "CheckToken");
    return false;
  }
}

ipcMain.handle("check-stored-token", () => {
  const hasToken = checkTokenInStore();
  return hasToken;
});

ipcMain.on("close-app-window", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

ipcMain.on("show-fontLoad-window", () => {
  createFontLoadingWindow();
});

ipcMain.on("show-mainapp-window", () => {
  mainWindow.show();
});

ipcMain.on("open-converter-window", () => {
  createTypeConverterWindow();
});

ipcMain.on("close-fontLoad-window", () => {
  fontLoadingModal.close();
  mainWindow.show();
});

ipcMain.on("show-login-window", () => {
  if (loginWindow) {
    loginWindow.close();
    createLoginWindow();
  } else {
    createLoginWindow();
  }
});

ipcMain.on("user-authenticated", (event, token) => {
  if (mainWindow) {
    if (mainWindow.isDestroyed()) {
      createWindow();
    } else {
      mainWindow.focus();
    }
  } else {
    if (dashWindows) {
      dashWindows.close();
      dashWindows = undefined;
    }
    createWindow();
  }
});

ipcMain.on("show-dashboard-window", () => {
  if (dashWindows) {
    if (dashWindows.isDestroyed()) {
      createDashWindow();
    } else {
      dashWindows.focus();
    }
  } else {
    createDashWindow();
  }
});

ipcMain.on("set-isUpdated", (event, state) => {
  isUpdated = state;
});

ipcMain.on("set-isEditing", (event, state) => {
  activeObjIsEditing = state;
});

ipcMain.on("set-active-obj", (event, obj) => {
  currentActiveObj = obj;
});

ipcMain.on("set-fileContent", (event, json, name) => {
  fileContent = json;
  fileName = name;
});

function checkInternetConnectivity() {
  return new Promise((resolve, reject) => {
    const options = {
      host: "www.google.com", // You can use any reliable website
      port: 80,
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      // If the request succeeds, resolve the promise
      resolve(true);
    });

    req.on("error", (err) => {
      // If there's an error, reject the promise
      reject(err);
    });

    req.end();
  });
}

ipcMain.handle("check-internet-connectity", async () => {
  let isOnline;

  await checkInternetConnectivity()
    .then((isConnected) => {
      if (isConnected) {
        isOnline = true;
      } else {
        isOnline = false;
      }
    })
    .catch((error) => {
      console.error("Error checking internet connectivity:", error);
      // Handle any errors that occur during the check
    });

  return isOnline;
});

const checkSessionValidity = async () => {
  const store = new Store();
  const user = store.get("userDetails");
  const webUrl = store.get("webUrl");

  let isValid;

  const getSession = async () => {
    const url = `${webUrl}/api/sessions/${user.sessionId}`;

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

  // Check if the system is connected to the internet
  let isOnline;

  await checkInternetConnectivity()
    .then((isConnected) => {
      if (isConnected) {
        isOnline = true;
      } else {
        isOnline = false;
      }
    })
    .catch((error) => {
      logMessageWithLocation(error, "Internet Checker");
      console.error("Error checking internet connectivity:", error);
      // Handle any errors that occur during the check
    });

  if (isOnline) {
    // If online, get session validity
    console.log("Connected to the internet");
    logMessageWithLocation("Connected to the internet", "Internet Checker");
    await getSession()
      .then((data) => {
        if (data.status === "Active") {
          isValid = true;
        } else {
          isValid = false;
        }
      })
      .catch((error) => {
        logMessageWithLocation(error, "Session Checker");
        console.log(error);
      });
  } else {
    console.log("Not connected to the internet");
    logMessageWithLocation("Not Connected to the internet", "Internet Checker");
    isValid = true;
  }

  return isValid;
};

ipcMain.handle("check-session-validity", async () => {
  const isValid = await checkSessionValidity();

  return isValid;
});

ipcMain.handle("open-filesave-dialog", async (event, fileContent, fileName) => {
  const path = await saveIfFile(fileContent, fileName);

  return path;
});

const saveIfFile = async (fileContent, fileName) => {
  if (!openFilePath) {
    openFilePath = dialog.showSaveDialogSync(mainWindow, {
      defaultPath: `${fileName}.if`,
      filters: [{ name: "IF File", extensions: ["if"] }],
    });
  }

  if (openFilePath) {
    await fsasy.writeFile(openFilePath, fileContent, "utf-8");
  }

  return openFilePath;
};

ipcMain.handle("open-pre-file", async () => {
  if (openFilePath) {
    const data = await fsasy.readFile(openFilePath, { encoding: "utf-8" });
    return data;
  }
});

ipcMain.handle("check-internet", async () => {
  // Check if the system is connected to the internet

  let isOnline;

  await checkInternetConnectivity()
    .then((isConnected) => {
      if (isConnected) {
        isOnline = true;
      } else {
        isOnline = false;
      }
    })
    .catch((error) => {
      console.error("Error checking internet connectivity:", error);
      // Handle any errors that occur during the check
    });

  return isOnline;
});

ipcMain.on("clear-file-path", () => {
  openFilePath = undefined;
});

ipcMain.handle("get-file-path", () => {
  return openFilePath;
});

ipcMain.on("update-file-path", (event, path) => {
  console.log(path);
  openFilePath = path;

  console.log(openFilePath);
});

ipcMain.on("close-if-application", () => {
  app.quit();
});

ipcMain.handle("open-file-import", async () => {
  const data = await importImageFile();
  return data;
});

const importImageFile = async () => {
  let filePath;

  const files = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: "Images", extensions: ["jpg", "png", "jpeg"] }],
    title: "Import Image File",
    buttonLabel: "Import",
  });

  filePath = files.filePaths[0];

  if (filePath) {
    try {
      const data = await fsasy.readFile(filePath, { encoding: "base64" });

      return data;
    } catch (err) {
      // Handle any errors that may occur during directory reading
      console.error("Error reading file:", err);
      // throw err; // Rethrow the error if needed
    }
  }
};

ipcMain.handle("open-svg-file-import", async () => {
  const data = await importSvgFile();
  return data;
});

const importSvgFile = async () => {
  let filePath;

  const files = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: "Images", extensions: ["svg"] }],
    title: "Import SVG File",
    buttonLabel: "Import",
  });

  filePath = files.filePaths[0];

  return filePath;
};

ipcMain.handle("open-if-file", async () => {
  const data = await openIfFile();
  return data;
});

ipcMain.handle("export-jpg-png-file", async (event, data, name, type) => {
  await openExportImageFile(data, name, type);
});

const openExportImageFile = async (data, name, type) => {
  exportFilePath = dialog.showSaveDialogSync(mainWindow, {
    defaultPath: `${name}.${type}`,
    filters: [{ name: "Image File", extensions: [type] }],
    title: "Export Image File",
    buttonLabel: "Export",
  });

  if (exportFilePath) {
    let updatedData = data.replace(/^data:image\/\w+;base64,/, "");
    let buf = Buffer.from(updatedData, "base64");
    await fsasy.writeFile(exportFilePath, buf, "binary");
  }
};

ipcMain.handle("export-svg-file", async (event, data, name) => {
  await openExportSVGFile(data, name);
});

const openExportSVGFile = async (data, name) => {
  exportFilePath = dialog.showSaveDialogSync(mainWindow, {
    defaultPath: `${name}.svg`,
    filters: [{ name: "SVG File", extensions: ["svg"] }],
    title: "Export SVG File",
    buttonLabel: "Export",
  });

  if (exportFilePath) {
    await fsasy.writeFile(exportFilePath, data);
  }
};

ipcMain.handle(
  "export-old-pdf-file",
  async (event, data, name, height, width) => {
    await openExportOldPDFFile(data, name, height, width);
  }
);

function saveOldPDF(pdf, filePath) {
  const writeStream = fs.createWriteStream(filePath);
  console.log(writeStream);

  pdf.pipe(writeStream);
  pdf.end(); // Ensure the PDF stream is closed

  writeStream.on("finish", () => {
    dialog.showMessageBox({
      message: "PDF saved successfully!",
      buttons: ["OK"],
    });
  });
}

const openExportOldPDFFile = async (svgString, name, height, width) => {
  // Create a PDF document
  const doc = new PDFDocument({ size: [width, height] });

  exportFilePath = dialog.showSaveDialogSync(mainWindow, {
    defaultPath: `${name}.pdf`,
    filters: [{ name: "PDF File", extensions: ["pdf"] }],
    title: "Export PDF File",
    buttonLabel: "Export",
  });

  if (exportFilePath) {
    doc.pipe(fs.createWriteStream(exportFilePath));

    // Trigger the conversion and save process
    SVGtoPDF(doc, svgString, 0, 0, { assumePt: true });
    doc.end();
  }
};

ipcMain.handle("export-pdf-file", async (event, data, name) => {
  await openExportPDFFile(data, name);
});

const openExportPDFFile = async (data, name) => {
  exportFilePath = dialog.showSaveDialogSync(mainWindow, {
    defaultPath: `${name}.pdf`,
    filters: [{ name: "PDF File", extensions: ["pdf"] }],
    title: "Export PDF File",
    buttonLabel: "Export",
  });

  if (exportFilePath) {
    let buf = Buffer.from(data);
    await fsasy.writeFile(exportFilePath, buf, "binary");
  }
};

const openIfFile = async () => {
  let filePath;

  const files = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: "IF File", extensions: ["if"] }],
  });

  filePath = files.filePaths[0];

  openFilePath = filePath;

  if (filePath) {
    const data = await fsasy.readFile(openFilePath, { encoding: "utf-8" });
    return data;
  }
};

ipcMain.handle("open-confirm-dialog", () => {
  const res = saveConfirmDialog();

  return res;
});

const saveConfirmDialog = async () => {
  const dialogRes = await dialog.showMessageBox({
    type: "warning",
    buttons: ["Save", "Don't Save", "Cancel"],
    title: "Confirm",
    message: "Do you wish to save this file?",
    defaultId: 0, // Index of the default button (Button 1 in this case)
    cancelId: 2, // Index of the cancel button (Button 3 in this case)
  });

  return dialogRes.response;
};

ipcMain.handle("session-end-dialogs", async () => {
  if (isUpdated) {
    const res = await sessionEndSaveConfirmDialog();

    if (res === 0) {
      await saveIfFile(fileContent, fileName);
      isUpdated = false;
      app.exit();
    } else if (res === 1) {
      app.exit();
    } else {
      app.exit();
    }
  } else {
    const infoRes = await infoDialog(
      "Your Session has expired, application will close now."
    );

    if (infoRes === 0) {
      app.exit();
    } else if (infoRes === 1) {
      app.exit();
    } else {
      app.exit();
    }
  }
});

const sessionEndSaveConfirmDialog = async () => {
  const dialogRes = await dialog.showMessageBox({
    type: "warning",
    buttons: ["Save", "Don't Save"],
    title: "Confirm",
    message:
      "Your Session has expired, Please save your file, application will close now.",
    defaultId: 0, // Index of the default button (Button 1 in this case)
    cancelId: 2, // Index of the cancel button (Button 3 in this case)
  });

  return dialogRes.response;
};

ipcMain.handle("open-paid-dialog", () => {
  const res = paidFeatureDialog();

  return res;
});

const paidFeatureDialog = async () => {
  const dialogRes = await dialog.showMessageBox({
    type: "info",
    buttons: ["Buy Now", "Cancel"],
    title: "Premium Feature",
    message:
      "Unlock this feature along with hundreds of premium calligraphy fonts. Ready to upgrade?",
    defaultId: 0, // Index of the default button (Button 1 in this case)
    cancelId: 1, // Index of the cancel button (Button 2 in this case)
  });

  return dialogRes.response;
};

ipcMain.on("open-info-dialog", (event, msg) => {
  infoDialog(msg);
});

ipcMain.on("set-zoom", (event, state) => {
  setZoom(state);
});

const infoDialog = async (msg) => {
  const dialogRes = await dialog.showMessageBox({
    type: "info",
    buttons: ["OK"],
    title: "IndiaFont V4",
    message: msg,
    defaultId: 0, // Index of the default button (Button 1 in this case)
    cancelId: 1, // Index of the cancel button (Button 2 in this case)
  });

  return dialogRes.response;
};

const zoomDialog = async () => {
  const dialogRes = dialog.showMessageBox({
    type: "info",
    buttons: ["OK"],
    title: "IndiaFont V4",
    message: msg,
    defaultId: 0, // Index of the default button (Button 1 in this case)
    cancelId: 1, // Index of the cancel button (Button 2 in this case)
  });

  return dialogRes.response;
};

const setZoom = (state) => {
  const currentFactor = mainWindow.webContents.getZoomFactor();

  let factor;
  if (state === "increase") {
    if (currentFactor > 1.5) {
      return dialog.showMessageBox({
        type: "info",
        buttons: ["OK"],
        title: "IndiaFont V4 | App Zoom Level",
        message: "Max Zoom In Level reached.",
        defaultId: 0, // Index of the default button (Button 1 in this case)
        cancelId: 1, // Index of the cancel button (Button 2 in this case)
      });
    } else {
      factor = currentFactor + 0.1;
    }
  }

  if (state === "decrease") {
    if (currentFactor < 0.8) {
      return dialog.showMessageBox({
        type: "info",
        buttons: ["OK"],
        title: "IndiaFont V4 | App Zoom Level",
        message: "Max Zoom Out Level reached.",
        defaultId: 0, // Index of the default button (Button 1 in this case)
        cancelId: 1, // Index of the cancel button (Button 2 in this case)
      });
    } else {
      factor = currentFactor - 0.1;
    }
  }

  if (state === "default") {
    factor = 1;
  }

  mainWindow.webContents.setZoomFactor(factor);
};

// Function to generate timestamp
function getTimeStamp() {
  const date = new Date();
  return date.toLocaleString(); // Format: YYYY-MM-DDTHH:mm:ss.sssZ
}

// Function to write logs to a file
function writeToLog(data) {
  let platform = os.platform();

  let logFilePath = path.join(__dirname, "app.log"); // Path to your log file

  if (platform === "win32") {
    logFilePath = path.join(app.getPath("userData"), "app.log");
  }

  // Generate the log entry with timestamp
  const logEntry = `[${getTimeStamp()}]: ${data}`;

  // Append the log to the file
  fs.appendFile(logFilePath, `${logEntry}\n`, (err) => {
    if (err) throw err;
    // console.log("Log has been written to the file.");
  });
}

ipcMain.on("write-log", (event, msg, location) => {
  logMessageWithLocation(msg, location);
});

function logMessageWithLocation(message, location) {
  const formattedMessage = `${message} at ${location}`;
  writeToLog(formattedMessage);
}
