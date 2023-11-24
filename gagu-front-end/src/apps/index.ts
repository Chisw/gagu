import { IApp } from '../types'
import FileExplorer from './FileExplorer'
import TextEditor from './TextEditor'
import PhotoViewer from './PhotoViewer'
import MusicPlayer from './Player/MusicPlayer'
import VideoPlayer from './Player/VideoPlayer'
import Settings from './Settings'
import BaiduMap from './web/BaiduMap'
import PQINA from './web/PQINA'

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
}

export const APP_LIST: IApp[] = [
  {
    id: APP_ID_MAP.fileExplorer,
    runningId: 0,
    AppComponent: FileExplorer,
    width: 1240,
    height: 720,
    resizeRange: {
      minWidth: 640,
      minHeight: 480,
    },
    multiple: true,
  },
  {
    id: APP_ID_MAP.textEditor,
    runningId: 0,
    AppComponent: TextEditor,
    width: 1000,
    height: 800,
    resizeRange: {
      minWidth: 240,
      minHeight: 100,
    },
    matchList: ['txt', 'md', 'html', 'xml', 'css', 'js', 'json', 'php', 'java', 'sh', 'log', 'md', 'ts', 'tsx'],
    headerClassName: 'bg-yellow-500 text-yellow-100 border-yellow-900 border-opacity-10',
    multiple: true,
    touchModeShow: true,
  },
  {
    id: APP_ID_MAP.photoViewer,
    runningId: 0,
    AppComponent: PhotoViewer,
    width: 960,
    height: 520,
    resizeRange: {
      minWidth: 480,
      minHeight: 480,
    },
    matchList: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'],
    headerClassName: 'bg-gray-800 text-gray-100 border-black border-opacity-10',
    multiple: true,
    touchModeShow: true,
  },
  {
    id: APP_ID_MAP.musicPlayer,
    runningId: 0,
    AppComponent: MusicPlayer,
    width: 480,
    height: 640,
    resizeRange: {
      minWidth: 480,
      minHeight: 240,
    },
    matchList: ['mp3', 'flac', 'wav', 'aac', 'ogg'],
    headerClassName: 'bg-pink-900 text-pink-100 border-black border-opacity-10',
    touchModeShow: true,
  },
  {
    id: APP_ID_MAP.videoPlayer,
    runningId: 0,
    AppComponent: VideoPlayer,
    width: 1280,
    height: 751,
    resizeRange: {
      minWidth: 640,
      minHeight: 400,
    },
    matchList: ['mp4', 'mkv', 'webm'],
    headerClassName: 'bg-gray-800 text-gray-100 border-black border-opacity-10',
    multiple: true,
    touchModeShow: true,
  },
  {
    id: APP_ID_MAP.settings,
    runningId: 0,
    AppComponent: Settings,
    width: 800,
    height: 600,
    resizeRange: {
      minWidth: 600,
      minHeight: 300,
    },
    headerClassName: 'bg-gray-700 text-gray-100 border-gray-900 border-opacity-10',
    touchModeShow: true,
  },
  {
    id: APP_ID_MAP.baiduMap,
    runningId: 0,
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
    AppComponent: PQINA,
    width: 800,
    height: 600,
    resizeRange: {
      minWidth: 800,
      minHeight: 600,
    },
    touchModeShow: true,
  },
]

export const CALLABLE_APP_LIST = APP_LIST.filter(app => !!app.matchList)
