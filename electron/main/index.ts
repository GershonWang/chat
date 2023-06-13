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
    // autoHideMenuBar: true //隐藏菜单栏
  })
  // 默认打开最大化界面
  win.maximize();
  // 移除默认的菜单栏，解决使用ctrl+alt+a快捷键截图时触发显示默认菜单栏的问题
  // Menu.setApplicationMenu(null);
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

app.whenReady().then(()=>{
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
// // 设置是否自动下载，默认是true,当点击检测到新版本时，会自动下载安装包，所以设置为false
// autoUpdater.autoDownload = false
// // 设置服务器更新地址
// autoUpdater.setFeedURL({
//   provider: 'generic',
//   url: updateUrl + '/v' + app.getVersion() + '/'
// })

// // autoUpdater.checkForUpdatesAndNotify(); // 自动检测更新并下载安装

// // 触发更新检测
// ipcMain.on('checkForUpdates', () => {
//   console.log('checkForUpdates');
//   autoUpdater.checkForUpdates();
//   // autoUpdater error检测
//   autoUpdater.on('error', function (err) {
//     console.log('error', err);
//     sendUpdateMessage('error', err || message.error)
//   })
//   autoUpdater.on('checking-for-update', function () {
//     sendUpdateMessage('checking-for-update', message.checking)
//   })
//   // 版本检测结束，准备更新
//   autoUpdater.on('update-available', function (info) {
//     console.log('update-available');
//     sendUpdateMessage('update-available', message.updateAva)
//   })
//   autoUpdater.on('update-not-available', function (info) {
//     console.log('update-not-available');
//     sendUpdateMessage('update-not-available', message.updateNotAva)
//   })
// })
// // 更新下载进度事件
// autoUpdater.on('download-progress', function (progressObj) {
//   sendUpdateMessage('download-progress', progressObj.percent)
// })
// // 下载完成
// // autoUpdater.on('update-downloaded', function (event: any, releaseNotes: any, releaseName: any, releaseDate: any, updateUrl: any, quitAndUpdate: any) {
// autoUpdater.on('update-downloaded', function () {
//   sendUpdateMessage('update-downloaded', '下载完成')
// })

// // 通过main进程发送事件给renderer进程，提示更新信息
// function sendUpdateMessage(name: string, text: string | number | Error) {
//   win.webContents.send('UpdateMessage', { name, text })
// }
// //  开始下载，通过渲染进程发起
// ipcMain.on('downloadUpdate', () => {
//   autoUpdater.downloadUpdate()
// })

// //  下载完成，退出且重新安装  
// ipcMain.on('updateSuccess', () => {
//   // 加载更新程序
//   autoUpdater.quitAndInstall()
//   // 关闭当前electron
//   app.quit()
// })


//检测更新
function updateHandle() {
  // 服务器静态文件地址，文章后面附上ng配置及需要上传的文件
  const updateUrl = 'https://github.com/GershonWang/chat/releases/download/'
  // 设置检查更新地址
  autoUpdater.setFeedURL(updateUrl);
  // 登录页面加载后触发此更新
  ipcMain.on("checkForUpdate",()=>{
      //执行自动更新检查
      autoUpdater.checkForUpdates();
  })
  // 更新出现异常
  autoUpdater.on('error', function (error) {
    win.webContents.send('checking_error', error)
  });
  // 开始检测更新
  autoUpdater.on('checking-for-update', function () {
    // 触发登录页面中的checking_for事件接收
    win.webContents.send('checking_for', "正在检测更新...")
  });
  // 当发现一个可用更新的时候触发，更新包下载会自动开始
  autoUpdater.on('update-available', function (info) {
    win.webContents.send('update_available')
    autoUpdater.downloadUpdate().then((path)=>{
      console.log('download path', path)
    }).catch((e)=>{
      console.log(e)
    })
  });
  //当没有可用更新的时候触发
  autoUpdater.on('update-not-available', function (info) {
    console.log("当前没有可用更新")
  });
  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    console.log(progressObj)
    win.webContents.send('downloadProgress', progressObj)
  })
  //安装包下载完成
  autoUpdater.on('update-downloaded', function () {
    win.webContents.send('update_downloaded')
    ipcMain.on('isUpdateNow', (e, arg) =>{
      console.log(arg);
      console.log("开始更新");
      //退出并安装
      autoUpdater.quitAndInstall();
    });
  });
  //获取当前版本
  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
  });
}