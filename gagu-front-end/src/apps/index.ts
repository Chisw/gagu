import { AppId, IApp } from '../types'
import FileExplorer from './FileExplorer'
import TextEditor from './TextEditor'
import PhotoViewer from './PhotoViewer'
import MusicPlayer from './MusicPlayer'
import VideoPlayer from './VideoPlayer'
import AndroidController from './AndroidController'
import Settings from './Settings'
import BaiduMap from './web/BaiduMap'
import PQINA from './web/PQINA'

export const APP_LIST: IApp[] = [
  {
    id: AppId.fileExplorer,
    runningId: 0,
    AppComponent: FileExplorer,
    width: 980,
    height: 540,
    resizeRange: {
      minWidth: 580,
      minHeight: 300,
    },
    multiple: true,
  },
  {
    id: AppId.textEditor,
    runningId: 0,
    AppComponent: TextEditor,
    width: 600,
    height: 500,
    resizeRange: {
      minWidth: 240,
      minHeight: 100,
    },
    matchList: ['txt', 'md', 'html', 'xml', 'css', 'js', 'json', 'php', 'java', 'sh', 'log', 'ts', 'tsx'],
    headerClassName: 'bg-yellow-500 dark:bg-yellow-700 text-yellow-100',
    multiple: true,
    touchModeShow: true,
  },
  {
    id: AppId.photoViewer,
    runningId: 0,
    AppComponent: PhotoViewer,
    width: 800,
    height: 400,
    resizeRange: {
      minWidth: 400,
      minHeight: 360,
    },
    matchList: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'],
    headerClassName: 'bg-gray-800 text-gray-100',
    multiple: true,
    touchModeShow: true,
  },
  {
    id: AppId.musicPlayer,
    runningId: 0,
    AppComponent: MusicPlayer,
    width: 480,
    height: 520,
    resizeRange: {
      minWidth: 440,
      minHeight: 240,
    },
    matchList: ['mp3', 'flac', 'wav', 'aac', 'ogg'],
    headerClassName: 'bg-pink-900 text-pink-100',
    touchModeShow: true,
  },
  {
    id: AppId.videoPlayer,
    runningId: 0,
    AppComponent: VideoPlayer,
    width: 720,
    height: 450,
    resizeRange: {
      minWidth: 500,
      minHeight: 300,
    },
    matchList: ['mp4', 'mkv', 'webm'],
    headerClassName: 'bg-gray-800 text-gray-100',
    multiple: true,
    touchModeShow: true,
  },
  {
    id: AppId.settings,
    runningId: 0,
    AppComponent: Settings,
    width: 800,
    height: 600,
    resizeRange: {
      minWidth: 640,
      minHeight: 300,
    },
    headerClassName: 'bg-zinc-700 text-zinc-100',
    touchModeShow: true,
  },
  {
    id: AppId.androidController,
    runningId: 0,
    AppComponent: AndroidController,
    width: 400,
    height: 600,
    resizeRange: {
      minWidth: 200,
      minHeight: 300,
    },
    headerClassName: 'bg-emerald-800 text-emerald-100',
    touchModeShow: true,
  },
  {
    id: AppId.baiduMap,
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
    id: AppId.pqina,
    runningId: 0,
    AppComponent: PQINA,
    width: 800,
    height: 600,
    resizeRange: {
      minWidth: 480,
      minHeight: 320,
    },
    touchModeShow: true,
  },
]

export const CALLABLE_APP_LIST = APP_LIST.filter(app => !!app.matchList)
