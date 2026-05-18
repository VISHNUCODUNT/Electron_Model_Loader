const { app, BrowserWindow, ipcMain, net, session } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#f3f3f3ff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    // ONLINE (Development Mode)
    // Electron loads the UI and 3D models via HTTP from the Vite dev server
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // OFFLINE (Production Mode)
    // Electron loads the compiled React code and the .glb files directly from the hard drive
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Set CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' data: blob: http://localhost:5173; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' *; img-src 'self' data: blob: *;"]
      }
    });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('check-online', () => net.isOnline());
