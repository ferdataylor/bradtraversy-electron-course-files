const path = require("path");
const os = require("os");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const imagemin = require("imagemin").default || require("imagemin");
const imageminMozjpeg =
  require("imagemin-mozjpeg").default || require("imagemin-mozjpeg");
const imageminPngquant =
  require("imagemin-pngquant").default || require("imagemin-pngquant");
const slash = require("slash").default || require("slash");
const log = require("electron-log");

// let envType = "development";
let envType = "production";

// Set the environment variable to development
process.env.NODE_ENV = envType;

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;
const isWin = process.platform === "win32" ? true : false;

let mainWindow;
let aboutWindow;

// NOTE: Another way to ensure the createMainWindow function is called when the app is ready
// app.on("ready", createMainWindow);

function createMainWindow() {
  function createWindow() {
    mainWindow = new BrowserWindow({
      title: "Image Shrink",
      width: isDev ? 1024 : 800,
      height: 600,
      icon: `${__dirname}/assets/icons/png/Icon_256x256.png`,
      resizable: isDev,
      backgroundColor: "#fff",
      webPreferences: {
        nodeIntegration: true, // integrates Node.js into the renderer process
        contextIsolation: false,
      },
    });

    // Open the DevTools automatically if in development mode
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    // NOTE: Load the index.html file from the app directory
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
      width: 350,
      height: 250,
      icon: `${__dirname}/assets/icons/png/Icon_256x256.png`,
      resizable: false,
      backgroundColor: "#fff",
    });

    // NOTE: Load the index.html file from the app directory
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

  // NOTE: We can get rid of these global shortcuts because
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

// NOTE: This is another way to add the developer menu
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

// Listen for the image:resize event from the renderer process
ipcMain.on("image:resize", async (e, options) => {
  try {
    options.dest = path.join(__dirname, "resized");

    await shrinkImage(options);
    // Example of sending a response back to the renderer process
    e.sender.send("image:done");
  } catch (error) {
    console.error("Error resizing image:", error);
    e.sender.send("image:error", error.message);
  }
});

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality === "high" ? 80 : quality === "medium" ? 60 : 40;
    // normalizedImgPath = path.normalize(imgPath).replace(/\\/g, "/");
    const file = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality / 100, pngQuality / 100],
        }),
      ],
    });

    console.log("Image: ", file);
    log.info("Image: ", file);

    shell.openPath(dest);
    mainWindow.webContents.send("image:done");
  } catch (error) {
    console.error("Error resizing image:", error);
    log.error("Error resizing image:", error);
    throw error;
  }
}
