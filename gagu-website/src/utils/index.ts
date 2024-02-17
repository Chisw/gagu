const DOC_LIST = [
  { key: 'what-is-gagu', group: 'Introduction', groupZh: '介绍', title: 'What is GAGU?', titleZh: 'GAGU 是？' },
  { key: 'project-origin', group: 'Introduction', groupZh: '介绍', title: 'Project Origin', titleZh: '项目起源' },
  { key: 'usage', group: 'Getting Started', groupZh: '起步', title: 'Usage', titleZh: '使用' },
  { key: 'feature-list', group: 'Getting Started', groupZh: '起步', title: 'Feature List ⏳', titleZh: '功能列表 ⏳' },
  { key: 'hotkeys', group: 'Getting Started', groupZh: '起步', title: 'Hotkeys', titleZh: '热键' },
  { key: 'scenarios', group: 'Getting Started', groupZh: '起步', title: 'Scenarios', titleZh: '场景' },
  { key: 'faq', group: 'Getting Started', groupZh: '起步', title: 'FAQ', titleZh: 'FAQ' },
  { key: 'type-definition', group: 'Development', groupZh: '开发', title: 'Type Definition ⏳', titleZh: '类型定义 ⏳' },
  { key: 'api-list', group: 'Development', groupZh: '开发', title: 'API List ⏳', titleZh: 'API 列表 ⏳' },
  { key: 'dev-and-build', group: 'Development', groupZh: '开发', title: 'Dev & Build', titleZh: '开发与构建' },
  { key: 'changelog', group: 'Others', groupZh: '其它', title: 'Changelog', titleZh: '更新日志' },
  { key: 'todo-list', group: 'Others', groupZh: '其它', title: 'Todo List', titleZh: '待办项' },
]

export const getDocList = (pathname) => {
  const isZh = pathname.replace(/\/*$/, '').endsWith('.zh')
  return DOC_LIST.map(({ key, group, groupZh, title, titleZh }) => ({
    group: isZh ? groupZh : group,
    title: isZh ? titleZh : title,
    path: `/docs/${group.toLocaleLowerCase().replaceAll(' ', '-')}/${key}${isZh ? '.zh' : ''}`,
  }))
}

export const getIsActive = (path, pathname) => {
  return path === pathname.replace(/\/*$/, '')
}

const svgLinux = `<svg style="display: inline; width: 14px; height: 14px;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4274" width="200" height="200"><path d="M867.5 805.6c-4.6-13.7-44.6-30.9-57.2-58.4s-2.3-42.3-21.7-56.1c-2.6-1.9-5.5-3-8.6-3.7 6.8-18 7-42.6 6.1-75-2.3-84.7-39.3-135.5-59.2-160.3-23.8-29.7-32-40.9-50.3-69.7-17.7-27.8-36.5-62-37.1-98.8-0.8-43.5-2.3-93.5-22.9-131.2s-71.8-74.9-144.2-54.9c-77.4 21.4-79.3 86.5-82.7 134.6s18.5 82.3 0.1 143.1-50.4 83.4-65.8 113.9c-38.1 75.5-46.2 82.2-62.9 121.1-18.5 42.9-4.6 68.3-4.6 68.3l0.8 2.1c-6.6 12.2-10.1 24.4-17.9 27.7-15.6 6.6-52.6-3.4-65.2 9.2s6.1 88.9-2.3 103c-8.4 14.1-16 13.7-16 36.6s25.2 20.6 123.6 53.8 116.7 24 139.6-4.6c3.8-4.7 6.2-9.9 7.6-15.4 30.1-2.7 60.5-5.1 78.2-5.2 39.3-0.2 94.3 12.2 119.9 18.5 3.7 9.9 9.1 17.9 16.3 21.6 20.6 10.3 68.7 9.2 97.3-18.3s100.7-62.9 109.9-72.1 23.7-16.1 19.2-29.8z m-411.9-528c-1.1-13-8.2-22.9-15.9-22.3s-13.1 11.7-12 24.6c0.6 7.2 3.1 13.5 6.5 17.5-1.2 1.1-2.3 2.1-3.4 3.1-5.6-7.3-10.3-19-11.5-33.3-2.1-24.7 7.5-44.1 17.5-44.9h0.7v-7.4 7.4c9.7 0 22 17 24 41.4 0.4 5.2 0.3 10.1-0.1 14.7-1.9 0.8-3.8 1.7-5.6 2.6-0.1-1-0.1-2.2-0.2-3.4zM441.4 291c0 0.1 0 0.1 0 0 0 0.1 0 0.1 0 0z m-2.5 2.2l-0.1 0.1 0.1-0.1z m-2.4 2.2l-0.1 0.1c0-0.1 0-0.1 0.1-0.1z m-9.6 8.5c0.6-0.5 1.1-1 1.7-1.5-0.6 0.6-1.1 1.1-1.7 1.5z m2-1.7c0.6-0.5 1.2-1.1 1.8-1.6-0.6 0.6-1.2 1.1-1.8 1.6z m38-25.7z m-21.6 49.3c2.5-2.1 4.9-4.3 7.2-6.4 10.7-9.8 17.9-15.8 27.5-16.2 1.1-0.1 2.2-0.1 3.3-0.1 16.3 0 32.8 5.8 55.2 19.6 2 1.2 3.9 2.3 5.7 3.4-5 4.5-11 9.7-17.9 15.3-15.9 12.9-27.7 20.9-33.8 24.3-4.5-2-12.7-6.5-24.9-14.9-13.3-9.2-23.5-17.8-26.1-20.4 1-1.6 2.3-3.3 3.8-4.6z m96-34.6c0.5 0.3 1.1 0.6 1.6 0.9-0.5-0.3-1-0.6-1.6-0.9z m1.7-38c-9.6-0.5-18.7 9.8-20.3 23-0.3 2.1-0.3 4.2-0.1 6.1-3.7-1.5-7.4-2.7-11-3.8-0.4-4.4-0.4-9 0.2-13.6 1.4-12 6.1-23.2 13-31.3 6.2-7.2 13.4-11.2 20.3-11.2h1c5.2 0.3 9.9 2.8 13.8 7.5 7.1 8.4 10.3 22.1 8.6 36.6-1.4 12-6.1 23.2-13 31.3-0.3 0.3-0.6 0.7-0.9 1l-0.9-0.6c-1.4-0.9-2.8-1.7-4.2-2.5 4.2-4.2 7.2-10.5 8.1-17.7 1.4-13.2-5-24.3-14.6-24.8z m4 41.2c-0.6-0.3-1.2-0.7-1.8-1 0.7 0.3 1.3 0.6 1.8 1z m-13.8-7.4c-0.4-0.2-0.9-0.4-1.3-0.6 0.4 0.2 0.8 0.4 1.3 0.6z m-3.9-1.8c-0.4-0.2-0.7-0.3-1.1-0.5 0.4 0.2 0.8 0.4 1.1 0.5z m-23.6-8.1c0.1 0 0.2 0.1 0.4 0.1-0.2-0.1-0.3-0.1-0.4-0.1z m51.5 23.3c-0.9-0.5-1.8-1.1-2.7-1.6 0.9 0.6 1.8 1.1 2.7 1.6z m6.8 3.9c-0.5-0.3-1.1-0.6-1.7-0.9 0.6 0.3 1.1 0.6 1.7 0.9z m-1.9-1c-0.7-0.4-1.5-0.9-2.3-1.3 0.8 0.4 1.6 0.9 2.3 1.3z m-2.4-1.4c-0.8-0.5-1.6-1-2.5-1.5 0.9 0.5 1.7 1 2.5 1.5z m32.7 509c-18 16.4-31.8 23.2-41.9 29.6-18.9 12-49.4 19.3-81.1 14.5-20.1-3-38.1-11.4-53.9-20.9-3.8-7.4-7.6-13.4-10.4-17-7-9.3-54.6-76.6-84.4-118.6-1.6-8.6-2.4-17-2.3-25 0.6-49.2 14.3-106.7 25.5-120.2 3.4-4.1 28.4-75.3 34.3-90.4 10.9-27.5 27.7-59.8 36.5-78.7 6-15.6 6.9-26.5 6.1-33.9 9.9 10.3 56.3 45.3 72.9 45.3h0.3c13.8-0.3 66.7-43.4 84.8-63.2 1.7 7.2 10.6 21.5 16.3 35.3 16.6 40.2 35.9 115.4 66.8 157.1 2.1 2.9 7.3 12.7 8.3 16.5 12 43.1 9.6 75.7 2.2 139.7-3.3-1.1-7.1-2-12.1-2.4-21.1-1.7-28.6 6.9-28.6 6.9s-1.2 47.4-3.5 91.3c-1.8 2-3.7 4-5.6 6-10.8 10.8-20.8 20.1-30.2 28.1z" fill="currentColor" p-id="4275"></path></svg>`
const svgMacos = `<svg xmlns="http://www.w3.org/2000/svg" style="display: inline; width: 14px; height: 14px;" viewBox="0 0 24 24"><path d="M11.6734 7.22198C10.7974 7.22198 9.44138 6.22598 8.01338 6.26198C6.12938 6.28598 4.40138 7.35397 3.42938 9.04597C1.47338 12.442 2.92538 17.458 4.83338 20.218C5.76938 21.562 6.87338 23.074 8.33738 23.026C9.74138 22.966 10.2694 22.114 11.9734 22.114C13.6654 22.114 14.1454 23.026 15.6334 22.99C17.1454 22.966 18.1054 21.622 19.0294 20.266C20.0974 18.706 20.5414 17.194 20.5654 17.11C20.5294 17.098 17.6254 15.982 17.5894 12.622C17.5654 9.81397 19.8814 8.46998 19.9894 8.40998C18.6694 6.47798 16.6414 6.26198 15.9334 6.21398C14.0854 6.06998 12.5374 7.22198 11.6734 7.22198ZM14.7934 4.38998C15.5734 3.45398 16.0894 2.14598 15.9454 0.849976C14.8294 0.897976 13.4854 1.59398 12.6814 2.52998C11.9614 3.35798 11.3374 4.68998 11.5054 5.96198C12.7414 6.05798 14.0134 5.32598 14.7934 4.38998Z" fill="currentColor"></path></svg>`
const svgWin = `<svg xmlns="http://www.w3.org/2000/svg" style="display: inline; width: 14px; height: 14px;" viewBox="0 0 24 24"><path d="M3.00098 5.47902L10.3778 4.4625V11.5902H3.00098V5.47902ZM3.00098 18.521L10.3778 19.5375V12.4982H3.00098V18.521ZM11.1894 19.646L21.001 21V12.4982H11.1894V19.646ZM11.1894 4.35402V11.5902H21.001V3L11.1894 4.35402Z" fill="currentColor"></path></svg>`

export const DOWNLOAD_LIST = [
  { svg: svgLinux, title: 'gagu@0.0.57.linux.arm.sh.zip', size: '20.7 MB', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.57/gagu@0.0.57.linux.arm.sh.zip' },
  { svg: svgLinux, title: 'gagu@0.0.57.linux.x64.sh.zip', size: '20.9 MB', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.57/gagu@0.0.57.linux.x64.sh.zip' },
  { svg: svgMacos, title: 'gagu@0.0.57.macos.arm.sh.zip', size: '20.0 MB', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.57/gagu@0.0.57.macos.arm.sh.zip' },
  { svg: svgMacos, title: 'gagu@0.0.57.macos.x64.sh.zip', size: '21.5 MB', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.57/gagu@0.0.57.macos.x64.sh.zip' },
  { svg: svgWin, title: 'gagu@0.0.57.win.arm.exe.zip', size: '13.4 MB', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.57/gagu@0.0.57.win.arm.exe.zip' },
  { svg: svgWin, title: 'gagu@0.0.57.win.x64.exe.zip', size: '17.9 MB', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.57/gagu@0.0.57.win.x64.exe.zip' },
]
