const list = [
  { group: 'Introduction', groupZh: '介绍', title: 'What is GAGU?', titleZh: 'GAGU 是？', key: 'what-is-gagu' },
  { group: 'Introduction', groupZh: '介绍', title: 'Project Origin', titleZh: '项目起源', key: 'project-origin' },
  { group: 'Getting Started', groupZh: '起步', title: 'Usage', titleZh: '使用方法', key: 'usage' },
  { group: 'Getting Started', groupZh: '起步', title: 'Features', titleZh: '功能', key: 'features' },
  { group: 'Getting Started', groupZh: '起步', title: 'Scenarios', titleZh: '场景', key: 'scenarios' },
  { group: 'Development', groupZh: '开发', title: 'Type Definition', titleZh: '类型定义', key: 'type-definition' },
  { group: 'Development', groupZh: '开发', title: 'API List', titleZh: 'API 列表', key: 'api-list' },
  { group: 'Development', groupZh: '开发', title: 'Dev & Build', titleZh: '开发与构建', key: 'dev-and-build' },
  { group: 'Others', groupZh: '其它', title: 'Changelog', titleZh: '更新日志', key: 'changelog' },
  { group: 'Others', groupZh: '其它', title: 'Todo List', titleZh: '待办项', key: 'todo-list' },
]

export const getDocList = (pathname) => {
  const isZh = pathname.replace(/\/*$/, '').endsWith('.zh')
  return list.map(({ group, groupZh, title, titleZh, key }) => ({
    group: isZh ? groupZh : group,
    title: isZh ? titleZh : title,
    path: `/docs/${group.toLocaleLowerCase().replaceAll(' ', '-')}/${key}${isZh ? '.zh' : ''}`,
  }))
}

export const getIsActive = (path, pathname) => {
  return path === pathname.replace(/\/*$/, '')
}

