/**
 * This section allows the window to reload automatically when changes are made to the app directory.
 * It uses the 'electron-reload' package to watch for changes and reload the app.
 */
// filepath: ~/Developer/.../bradtraversy-electron-course-files/image-shrink/main.js
const path = require("path");
const electronReload = require("electron-reload");

module.exports = () => {
  const electronBinaryPath = path.join(
    __dirname,
    "../node_modules/.bin/electron"
  );
  electronReload(path.join(__dirname, "../app"), {
    electron: electronBinaryPath,
  });
};

// ### ADD THIS TO THE TOP OF YOUR MAIN.JS FILE ###
// This goes right after the require statements
// if you want to use the reload functionality.

// // Import the reload logic
// require("./utils/reload")();
