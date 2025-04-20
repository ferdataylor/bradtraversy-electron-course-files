// const path = require("path");

// // Import the reload logic
// require("./utils/reload")();

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  globalShortcut,
} = require("electron");

// Set the environment variable to development
process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;
const isWin = process.platform === "win32" ? true : false;
const isLinux = process.platform === "linux" ? true : false;

let mainWindow;
let aboutWindow;

// Another way to ensure the createMainWindow function is called when the app is ready
// app.on("ready", createMainWindow);

function createMainWindow() {
  function createWindow() {
    mainWindow = new BrowserWindow({
      title: "Image Shrink",
      width: 800,
      height: 600,
      icon: `${__dirname}/assets/icons/png/Icon_256x256.png`,
      resizable: isDev,
      backgroundColor: "#fff",
    });

    // Load the index.html file from the app directory
    // mainWindow.loadURL(`file://${__dirname}/app/index.html`);

    // Load the index.html file using the path module to resolve the correct path.
    mainWindow.loadFile("./app/index.html");
  }

  // Call createWindow when the app is ready
  createWindow();
}

function createAboutWindow() {
  function createWindow() {
    aboutWindow = new BrowserWindow({
      title: "About ImageShrink",
      width: 800,
      height: 600,
      icon: `${__dirname}/assets/icons/png/Icon_256x256.png`,
      resizable: false,
      backgroundColor: "#fff",
    });

    // Load the index.html file from the app directory
    // mainWindow.loadURL(`file://${__dirname}/app/index.html`);

    // Load the index.html file using the path module to resolve the correct path.
    aboutWindow.loadFile("./app/about.html");
  }

  // Call createWindow when the app is ready
  createWindow();
}

// Garbage collection, point to null when closed
app.on("ready", () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // We can get rid of these global shortcuts because
  // the shortcuts are enabled in the developer menu
  // in the menu bar by default.
  // globalShortcut.register("CmdOrCtrl+R", () => {
  //   mainWindow.reload();
  // });
  // globalShortcut.register(isMac ? "Command+Alt+I" : "Ctrl+Shift+I", () => {
  //   mainWindow.toggleDevTools();
  // });

  mainWindow.on("ready", () => {
    mainWindow = null;
  });
});

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: () => {
                createAboutWindow();
              },
            },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  { role: "fileMenu" },
  ...(isWin
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: () => {
                createAboutWindow();
              },
            },
          ],
        },
      ]
    : []),
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

// This is another way to add the developer menu
// if (isDev) {
//   menu.push({
//     label: "Developer",
//     submenu: [
//       {
//         role: "reload",
//       },
//       {
//         role: "forcereload",
//       },
//       {
//         role: "toggledevtools",
//       },
//     ],
//   });
// }

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
