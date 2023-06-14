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

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'logo.png'), // 设置图标路径(ICO、PNG、JPEG、BMP)
    width: 900,
    height: 500,
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
    win.loadURL(url)
    // dev开发环境，打开devTool开发者工具
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(indexHtml)
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
    createWindow()
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
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// 监听页面发出的关闭程序请求
ipcMain.on('close-app', () => {
  app.quit();
});

/****************************************** 自动更新 ***********************************************/
// // 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
// let message = {
//   error: '检查更新出错',
//   checking: '正在检查更新……',
//   updateAva: '检测到新版本，正在下载……',
//   updateNotAva: '现在使用的就是最新版本，不用更新'
// }

//检测更新
function updateHandle() {
  // 服务器静态文件地址，文章后面附上ng配置及需要上传的文件
  // const updateUrl = 'https://github.com/GershonWang/chat/releases/download/'
  // 设置检查更新地址
  // autoUpdater.setFeedURL(updateUrl);

  // 设置更新源为GitHub Release
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'GershonWang',
    repo: 'chat',
    releaseType: 'release'
  })
  // 设置不自动下载
  autoUpdater.autoDownload = false;
  // 登录页面加载后触发此更新
  ipcMain.on("checkForUpdate", () => {
    //执行自动更新检查
    autoUpdater.checkForUpdates();
  })
  // 更新出现异常
  autoUpdater.on('error', function (error) {
    win.webContents.send('updateError', error)
  });
  // 开始检测更新
  autoUpdater.on('checking-for-update', function () {
    // 触发登录页面中的checking_for事件接收
    win.webContents.send('checking_for', "正在检测更新...")
  });
  // 当发现一个可用更新的时候触发，更新包下载会自动开始
  autoUpdater.on('update-available', function (info) {
    win.webContents.send('update_available')
  });
  //当没有可用更新的时候触发
  autoUpdater.on('update-not-available', function (info) {
    win.webContents.send('update-not-available')
  });
  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    win.webContents.send('downloadProgress', progressObj)
  })
  // 安装包下载完成
  // autoUpdater.on('update-downloaded', function () {
  //   win.webContents.send('update_downloaded')
  //   ipcMain.on('isUpdateNow', (e, arg) =>{
  //     console.log(arg);
  //     console.log("开始更新");
  //     //退出并安装
  //     autoUpdater.quitAndInstall();
  //   });
  // });
  // 获取当前版本
  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
  });
  // 立即更新
  ipcMain.on('isUpdateNow', (event) => {
    autoUpdater.downloadUpdate().then((path) => {
      event.sender.send('UpdateMessage', path);
    }).catch((e) => {
      event.sender.send('updateError', e);
    })
  })
}