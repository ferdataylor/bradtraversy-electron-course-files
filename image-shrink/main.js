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

// // Ensure the createMainWindow function is called when the app is ready
// app.on("ready", createMainWindow);

// Garbage collection, point to null when closed
app.on("ready", () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  globalShortcut.register("CmdOrCtrl+R", () => {
    mainWindow.reload();
  });

  globalShortcut.register(isMac ? "Command+Alt+I" : "Ctrl+Shift+I", () => {
    mainWindow.toggleDevTools();
  });

  mainWindow.on("ready", () => {
    mainWindow = null;
  });
});

const menu = [
  ...(isMac ? [{ role: "appMenu" }] : []),
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        // accelerator: isMac ? "Command+Q" : "Ctrl+Q", // Shortcut for quitting the app
        accelerator: "CmdOrCtrl+Q", // Shorter-cut for quitting, should work on all platforms
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      {
        role: "undo",
      },
      {
        role: "redo",
      },
      {
        type: "separator",
      },
      {
        role: "cut",
      },
      {
        role: "copy",
      },
      {
        role: "paste",
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: "View",
          submenu: [
            {
              role: "reload",
            },
            {
              role: "forcereload",
            },
            {
              role: "toggledevtools",
            },
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
