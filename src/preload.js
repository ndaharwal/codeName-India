// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { ipcRenderer, contextBridge, dialog, shell } = require("electron");
const Store = require("electron-store");
const path = require("path");
const fs = require("fs");
const fsasy = require("fs").promises;
const os = require("os");
const crypto = require("crypto");
const { promisify } = require("util");
const { app } = require("electron");

const store = new Store();

contextBridge.exposeInMainWorld("electronAPI", {
  showLoginWindow: () => {
    ipcRenderer.send("show-login-window");
  },
  goToDashboard: () => {
    ipcRenderer.send("show-dashboard-window");
  },
  authenticate: (token) => {
    store.set("authToken", token);
    // ipcRenderer.send("user-authenticated", token);
  },
  openMainApp: (token) => {
    ipcRenderer.send("user-authenticated", token);
  },
  updateUserDetails: (data) => {
    store.set("userDetails", data);
  },
  getUserDetails: () => {
    // ipcRenderer.send("update-user-details");
    const data = store.get("userDetails");

    return data;
  },
  setTrialMode: (value) => {
    store.set("isTrial", value);
  },
  setTrialEndDate: (date) => {
    store.set("trialEndDate", date);
  },
  setSubEndDate: (date) => {
    store.set("subEndDate", date);
  },
  getTrialEndDate: () => {
    const trialEndDate = store.get("trialEndDate");

    return trialEndDate;
  },
  getSubEndDate: () => {
    const subEndDate = store.get("subEndDate");

    return subEndDate;
  },
  checkIfTrial: () => {
    const isTrial = store.get("isTrial");

    return isTrial;
  },
  setStoreFonts: (data) => {
    store.set("fontObjects", data);
  },
  getStoredFonts: () => {
    const fontObjects = store.get("fontObjects");

    return fontObjects;
  },
  signOutUser: () => {
    store.delete("authToken");
  },
  getDeviceName: () => {
    const deviceName = store.get("deviceName");

    return deviceName;
  },
  setSessionDetails: (sessions) => {
    store.set("sessions", sessions);
  },
  getSessionDetails: () => {
    const sessions = store.get("sessions");

    return sessions;
  },
  checkInternetConnectivity: async () => {
    const isOnline = await ipcRenderer.invoke("check-internet");
    return isOnline;
  },
  openSaveFileDialog: async (fileContent, fileName) => {
    const path = await ipcRenderer.invoke(
      "open-filesave-dialog",
      fileContent,
      fileName
    );
    return path;
  },
  clearOpenFilePath: () => {
    ipcRenderer.send("clear-file-path");
  },
  getOpenFilePath: () => {
    const path = ipcRenderer.invoke("get-file-path");
    return path;
  },
  updateOpenFilePath: (path) => {
    ipcRenderer.send("update-file-path", path);
  },
  closeApplication: () => ipcRenderer.send("close-if-application"),
  pullLibraryFiles: async (folderpath) => {
    let sourcePath;
    let platform = os.platform();

    if (platform === "darwin") {
      sourcePath = __dirname.split(`app.asar/src`)[0];
    }

    if (platform === "win32") {
      sourcePath = __dirname.split(`app.asar\\src`)[0];
    }

    let data = await pullFilesFromFolder(path.join(sourcePath, folderpath));

    return data;
  },
  openIFFileDialog: async () => {
    const file = await ipcRenderer.invoke("open-if-file");

    return file;
  },
  openImportDialog: async () => {
    const file = await ipcRenderer.invoke("open-file-import");

    return file;
  },
  openImportSVGDialog: async () => {
    const file = await ipcRenderer.invoke("open-svg-file-import");

    return file;
  },
  exportJPGPNG: async (data, name, type) => {
    await ipcRenderer.invoke("export-jpg-png-file", data, name, type);
  },
  exportSVG: async (data, name) => {
    await ipcRenderer.invoke("export-svg-file", data, name);
  },
  exportPDF: async (data, name) => {
    await ipcRenderer.invoke("export-pdf-file", data, name);
  },
  exportOldPDF: async (data, name, height, width) => {
    await ipcRenderer.invoke("export-old-pdf-file", data, name, height, width);
  },
  openPreFilePath: async () => {
    const path = await ipcRenderer.invoke("open-pre-file");

    return path;
  },
  openConfimSaveDialog: async () => {
    const res = await ipcRenderer.invoke("open-confirm-dialog");

    return res;
  },
  openPaidDialog: async () => {
    const res = await ipcRenderer.invoke("open-paid-dialog");

    return res;
  },
  openInfoDialog: (msg) => {
    ipcRenderer.send("open-info-dialog", msg);
  },
  zoomSetting: (state) => {
    ipcRenderer.send("set-zoom", state);
  },
  openExternalLink: (urlToOpen) => {
    shell.openExternal(urlToOpen);
  },
  setIsUpdated: (state) => {
    ipcRenderer.send("set-isUpdated", state);
  },
  setIsEditing: (state) => {
    ipcRenderer.send("set-isEditing", state);
  },
  setActiveObj: (state) => {
    ipcRenderer.send("set-active-obj", state);
  },
  setFileContent: (json, name) => {
    ipcRenderer.send("set-fileContent", json, name);
  },
  getWebUrl: () => {
    const webUrl = store.get("webUrl");

    return webUrl;
  },
  checkLibInstall: () => {
    const libraryStatus = store.get("isLibInstalled");

    return libraryStatus;
  },
  closeAppWindow: () => {
    ipcRenderer.send("close-app-window");
  },
  showMainAppWindow: () => {
    ipcRenderer.send("show-mainapp-window");
  },
  showFontLoadWindow: () => {
    ipcRenderer.send("show-fontLoad-window");
  },
  closeFontLoadWindow: () => {
    ipcRenderer.send("close-fontLoad-window");
  },
  runCipherData: async (data, password) => {
    const fData = await cipherData(data, password);

    return fData;
  },
  runDeCipherData: async (encryptedData, iv, salt, password) => {
    const fData = await decipherData(encryptedData, iv, salt, password);

    return fData;
  },
  checkSessionValidity: async () => {
    const isValid = await ipcRenderer.invoke("check-session-validity");

    return isValid;
  },
  checkStoredToken: () => {
    const hasToken = ipcRenderer.invoke("check-stored-token");

    return hasToken;
  },
  checkInternetConnectivity: async () => {
    const isOnline = await ipcRenderer.invoke("check-internet-connectity");

    return isOnline;
  },
  sessionEndAppClose: async () => {
    await ipcRenderer.invoke("session-end-dialogs");
  },
  logErrorsInFile: (msg, location) => {
    ipcRenderer.send("write-log", msg, location);
  },
  openTypeConverterWindow: () => {
    ipcRenderer.send("open-converter-window");
  },
});

const pullFilesFromFolder = async (path) => {
  try {
    // Use await to asynchronously read the contents of the directory
    const files = await fsasy.readdir(path);

    // 'files' now contains an array of filenames in the directory
    return files;
  } catch (err) {
    // Handle any errors that may occur during directory reading
    console.error("Error reading directory:", err);
    // throw err; // Rethrow the error if needed
  }
};

const scryptAsync = promisify(crypto.scrypt);

const cipherData = async (text, password) => {
  const salt = crypto.randomBytes(16); // Generate a random salt
  const key = await scryptAsync(password, salt, 32);
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    encryptedData: encrypted,
  };
};

const decipherData = async (encryptedData, iv, salt, password) => {
  const key = await scryptAsync(password, Buffer.from(salt, "hex"), 32);
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

