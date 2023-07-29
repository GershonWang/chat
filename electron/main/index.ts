import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { autoUpdater } from 'electron-updater'

process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, '../public') : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

/****************************************** 自动更新 ***********************************************/
function updateHandle() {
  // 设置更新源为GitHub Release
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'GershonWang',
    repo: 'ChatGpt',
    releaseType: 'release'
  })
  // 设置不自动下载
  autoUpdater.autoDownload = false;
  autoUpdater.on('error', function (error) {
    console.log('更新出现异常');
    win.webContents.send('updateError', error)
  });
  autoUpdater.on('checking-for-update', function () {
    console.log('开始检测更新,触发登录页面中的checking_for事件接收');
    win.webContents.send('checking_for', "正在检测更新...")
  });
  autoUpdater.on('update-available', function (info) {
    console.log('当发现一个可用更新的时候触发，更新包下载会自动开始',info);
    win.webContents.send('update_available')
  });
  autoUpdater.on('update-not-available', function (info) {
    console.log('当没有可用更新的时候触发',info);
    win.webContents.send('update-not-available')
  });
  autoUpdater.on('download-progress', function (progressObj) {
    console.log('更新下载进度事件');
    win.webContents.send('downloadProgress', progressObj)
  })
  // 安装包下载完成
  autoUpdater.on('update-downloaded', function () {
    win.webContents.send('update_downloaded')
    ipcMain.on('isUpdateNow', (e, arg) =>{
      console.log(arg);
      console.log("开始更新");
      //退出并安装
      autoUpdater.quitAndInstall();
    });
  });
}

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'logo.png'), // 设置图标路径(ICO、PNG、JPEG、BMP)
    width: 1366,
    height: 768,
    // frame: false, // 隐藏标题栏
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true //隐藏菜单栏
  })
  // 默认打开最大化界面
  win.maximize();
  // 移除默认的菜单栏，解决使用ctrl+alt+a快捷键截图时触发显示默认菜单栏的问题
  Menu.setApplicationMenu(null);
  // 根据环境判断是否开启开发者工具
  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(url)
    // dev开发环境，打开devTool开发者工具
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    await win.loadFile(indexHtml)
  }
  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })
  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(() => {
  createWindow();
  updateHandle();
});

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow();
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })
  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`).then(r => {
      console.log('childWindow.loadURL r',r)
    })
  } else {
    childWindow.loadFile(indexHtml, {hash: arg}).then(r => {
      console.log('childWindow.loadFile r',r)
    })
   }
})

// 获取当前版本
ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});
// 登录页面加载后触发此更新
ipcMain.on("checkForUpdate", (event) => {
  console.log('登录页面加载后触发此更新',event)
  console.log('子加载 autoUpdater',autoUpdater)
  autoUpdater.checkForUpdates().then(r => {
    console.log('执行自动更新检查',r)
  })
  console.log('加载后 autoUpdater',autoUpdater)
})
// 立即更新
ipcMain.on('isUpdateNow', (event) => {
  autoUpdater.downloadUpdate().then((path) => {
    event.sender.send('UpdateMessage', path);
  }).catch((e) => {
    event.sender.send('updateError', e);
  })
})
// 监听页面发出的关闭程序请求
ipcMain.on('close-app', () => {
  app.quit();
});