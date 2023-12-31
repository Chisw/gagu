const DOC_LIST = [
  { group: 'Introduction', groupZh: '介绍', title: 'What is GAGU?', titleZh: 'GAGU 是？', key: 'what-is-gagu' },
  { group: 'Introduction', groupZh: '介绍', title: 'Project Origin', titleZh: '项目起源', key: 'project-origin' },
  { group: 'Getting Started', groupZh: '起步', title: 'Usage', titleZh: '使用', key: 'usage' },
  { group: 'Getting Started', groupZh: '起步', title: 'Features ⏳', titleZh: '功能 ⏳', key: 'features' },
  { group: 'Getting Started', groupZh: '起步', title: 'Hotkeys', titleZh: '热键', key: 'hotkeys' },
  { group: 'Getting Started', groupZh: '起步', title: 'Scenarios', titleZh: '场景', key: 'scenarios' },
  { group: 'Development', groupZh: '开发', title: 'Type Definition ⏳', titleZh: '类型定义 ⏳', key: 'type-definition' },
  { group: 'Development', groupZh: '开发', title: 'API List ⏳', titleZh: 'API 列表 ⏳', key: 'api-list' },
  { group: 'Development', groupZh: '开发', title: 'Dev & Build', titleZh: '开发与构建', key: 'dev-and-build' },
  { group: 'Others', groupZh: '其它', title: 'Changelog', titleZh: '更新日志', key: 'changelog' },
  { group: 'Others', groupZh: '其它', title: 'Todo List', titleZh: '待办项', key: 'todo-list' },
]

export const getDocList = (pathname) => {
  const isZh = pathname.replace(/\/*$/, '').endsWith('.zh')
  return DOC_LIST.map(({ group, groupZh, title, titleZh, key }) => ({
    group: isZh ? groupZh : group,
    title: isZh ? titleZh : title,
    path: `/docs/${group.toLocaleLowerCase().replaceAll(' ', '-')}/${key}${isZh ? '.zh' : ''}`,
  }))
}

export const getIsActive = (path, pathname) => {
  return path === pathname.replace(/\/*$/, '')
}

export const DOWNLOAD_LIST = [
  { platform: 'linux', title: 'gagu@0.0.54.linux.arm.sh.zip', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.54/gagu@0.0.54.linux.arm.sh.zip' },
  { platform: 'linux', title: 'gagu@0.0.54.linux.x64.sh.zip', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.54/gagu@0.0.54.linux.x64.sh.zip' },
  { platform: 'macos', title: 'gagu@0.0.54.macos.arm.sh.zip', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.54/gagu@0.0.54.macos.arm.sh.zip' },
  { platform: 'macos', title: 'gagu@0.0.54.macos.x64.sh.zip', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.54/gagu@0.0.54.macos.x64.sh.zip' },
  { platform: 'win', title: 'gagu@0.0.54.win.arm.exe.zip', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.54/gagu@0.0.54.win.arm.exe.zip' },
  { platform: 'win', title: 'gagu@0.0.54.win.x64.exe.zip', url: 'https://github.com/Chisw/gagu/releases/download/v0.0.54/gagu@0.0.54.win.x64.exe.zip' },
]
