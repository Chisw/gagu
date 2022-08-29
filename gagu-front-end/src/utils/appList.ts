import { IApp } from '../types'
import FileExplorer from '../apps/FileExplorer'
import TextEditor from '../apps/TextEditor'
import PhotoGallery from '../apps/PhotoGallery'
import MusicPlayer from '../apps/MusicPlayer'
import VideoPlayer from '../apps/VideoPlayer'
import Settings from '../apps/Settings'
import BaiduMap from '../apps/BaiduMap'
import PQINA from '../apps/PQINA'
import PS from '../apps/PS'
// import WebAMP from '../apps/WebAMP'

export const APP_ID_MAP = {
  fileExplorer: 'file-explorer',
  transfer: 'transfer',
  textEditor: 'text-editor',
  photoGallery: 'photo-gallery',
  musicPlayer: 'music-player',
  videoPlayer: 'video-player',
  settings: 'settings',
  baiduMap: 'baidu-map',
  pqina: 'pqina',
  ps: 'ps',
  webamp: 'webamp',
}

const APP_LIST: IApp[] = [
  {
    id: APP_ID_MAP.fileExplorer,
    runningId: 0,
    title: '文件管理器',
    AppComponent: FileExplorer,
    width: 980,
    height: 640,
    resizeRange: {
      minWidth: 640,
      minHeight: 480,
    },
  },
  {
    id: APP_ID_MAP.textEditor,
    runningId: 0,
    title: '文本编辑器',
    AppComponent: TextEditor,
    width: 960,
    height: 720,
    resizeRange: {
      minWidth: 240,
      minHeight: 100,
    },
    matchList: ['txt', 'md', 'html', 'xml', 'css', 'js', 'json', 'php', 'java', 'sh', 'log', 'md', 'ts', 'tsx'],
  },
  {
    id: APP_ID_MAP.photoGallery,
    runningId: 0,
    title: '图片浏览器',
    AppComponent: PhotoGallery,
    width: 720,
    height: 640,
    resizeRange: {
      minWidth: 240,
      minHeight: 200,
    },
    matchList: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'],
  },
  {
    id: APP_ID_MAP.musicPlayer,
    runningId: 0,
    title: '音乐播放器',
    AppComponent: MusicPlayer,
    width: 400,
    height: 600,
    resizeRange: {
      maxWidth: 400,
      maxHeight: 800,
      minWidth: 400,
      minHeight: 200,
    },
    matchList: ['mp3', 'aac', 'flac'],
  },
  {
    id: APP_ID_MAP.videoPlayer,
    runningId: 0,
    title: '视频播放器',
    AppComponent: VideoPlayer,
    width: 640,
    height: 400,
    resizeRange: {
      minWidth: 320,
      minHeight: 240,
    },
    matchList: ['mp4', 'mkv'],
  },
  {
    id: APP_ID_MAP.settings,
    runningId: 0,
    title: '偏好设置',
    AppComponent: Settings,
    width: 500,
    height: 500,
    resizeRange: {
      minWidth: 500,
      minHeight: 300,
    },
  },
  {
    id: APP_ID_MAP.baiduMap,
    runningId: 0,
    title: '百度地图',
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
    title: 'PQINA',
    AppComponent: PQINA,
    width: 800,
    height: 600,
    resizeRange: {
      minWidth: 800,
      minHeight: 600,
    },
  },
  {
    id: APP_ID_MAP.ps,
    runningId: 0,
    title: 'PS',
    AppComponent: PS,
    width: 1000,
    height: 800,
    resizeRange: {
      minWidth: 800,
      minHeight: 600,
    },
  },
  // {
  //   id: APP_ID_MAP.webamp,
  //   runningId: 0,
  //   title: 'WebAMP',
  //   AppComponent: WebAMP,
  //   width: 600,
  //   height: 300,
  //   resizeRange: {
  //     minWidth: 800,
  //     minHeight: 600,
  //   },
  //   matchList: ['mp3', 'aac', 'flac'],
  // },
]

export const CALLABLE_APP_LIST = APP_LIST.filter(app => !!app.matchList)

export default APP_LIST
