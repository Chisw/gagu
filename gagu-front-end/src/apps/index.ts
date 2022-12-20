import { IApp } from '../types'
import FileExplorer from './FileExplorer'
import TextEditor from './TextEditor'
import PhotoViewer from './PhotoViewer'
import MusicPlayer from './Player/MusicPlayer'
import VideoPlayer from './Player/VideoPlayer'
import Settings from './Settings'
import BaiduMap from './BaiduMap'
import PQINA from './PQINA'
import { _t } from '../i18n'

export const APP_ID_MAP = {
  fileExplorer: 'file-explorer',
  transfer: 'transfer',
  textEditor: 'text-editor',
  photoViewer: 'photo-viewer',
  musicPlayer: 'music-player',
  videoPlayer: 'video-player',
  settings: 'settings',
  baiduMap: 'baidu-map',
  pqina: 'pqina',
  webamp: 'webamp',
}

export const APP_LIST: IApp[] = [
  {
    id: APP_ID_MAP.fileExplorer,
    runningId: 0,
    name: _t`app.fileExplorer`,
    AppComponent: FileExplorer,
    width: 980,
    height: 640,
    resizeRange: {
      minWidth: 640,
      minHeight: 480,
    },
    multiple: true,
  },
  {
    id: APP_ID_MAP.textEditor,
    runningId: 0,
    name: _t`app.textEditor`,
    AppComponent: TextEditor,
    width: 960,
    height: 720,
    resizeRange: {
      minWidth: 240,
      minHeight: 100,
    },
    matchList: ['txt', 'md', 'html', 'xml', 'css', 'js', 'json', 'php', 'java', 'sh', 'log', 'md', 'ts', 'tsx'],
    multiple: true,
  },
  {
    id: APP_ID_MAP.photoViewer,
    runningId: 0,
    name: _t`app.photoViewer`,
    AppComponent: PhotoViewer,
    width: 720,
    height: 480,
    resizeRange: {
      minWidth: 480,
      minHeight: 480,
    },
    matchList: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'],
    headerClassName: 'bg-gray-800 text-gray-100 border-black-100',
    multiple: true,
  },
  {
    id: APP_ID_MAP.musicPlayer,
    runningId: 0,
    name: _t`app.musicPlayer`,
    AppComponent: MusicPlayer,
    width: 480,
    height: 640,
    resizeRange: {
      minWidth: 480,
      minHeight: 240,
    },
    matchList: ['mp3', 'aac', 'flac'],
    headerClassName: 'bg-pink-900 text-pink-100 border-black-100',
  },
  {
    id: APP_ID_MAP.videoPlayer,
    runningId: 0,
    name: _t`app.videoPlayer`,
    AppComponent: VideoPlayer,
    width: 640,
    height: 400,
    resizeRange: {
      minWidth: 640,
      minHeight: 400,
    },
    matchList: ['mp4', 'mkv'],
    headerClassName: 'bg-gray-800 text-gray-100 border-black-100',
    multiple: true,
  },
  {
    id: APP_ID_MAP.settings,
    runningId: 0,
    name: _t`app.settings`,
    AppComponent: Settings,
    width: 800,
    height: 600,
    resizeRange: {
      minWidth: 600,
      minHeight: 300,
    },
  },
  {
    id: APP_ID_MAP.baiduMap,
    runningId: 0,
    name: _t`app.baiduMap`,
    AppComponent: BaiduMap,
    width: 800,
    height: 600,
    resizeRange: {
      minWidth: 480,
      minHeight: 320,
    },
  },
  {
    id: APP_ID_MAP.pqina,
    runningId: 0,
    name: _t`app.pqina`,
    AppComponent: PQINA,
    width: 800,
    height: 600,
    resizeRange: {
      minWidth: 800,
      minHeight: 600,
    },
  },
]

export const CALLABLE_APP_LIST = APP_LIST.filter(app => !!app.matchList)
