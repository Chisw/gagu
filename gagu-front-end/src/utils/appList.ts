import { IApp } from './types'
import iconFileExplorer from '../img/icons/app-file-explorer.png'
import iconTransfer from '../img/icons/app-transfer.png'
import iconTextEditor from '../img/icons/app-text-editor.png'
import iconPhotoGallery from '../img/icons/app-photo-gallery.png'
import iconMusicPlayer from '../img/icons/app-music-player.png'
import iconVideoPlayer from '../img/icons/app-video-player.png'
import iconSettings from '../img/icons/app-settings.png'
import iconBaiduMap from '../img/icons/app-baidu-map.png'
import iconPQINA from '../img/icons/app-pqina.png'
import iconPS from '../img/icons/app-ps.png'
import bgMusic from '../img/bg-music.jpg'
import FileExplorer from '../apps/FileExplorer'
import Transfer from '../apps/Transfer'
import TextEditor from '../apps/TextEditor'
import PhotoGallery from '../apps/PhotoGallery'
import MusicPlayer from '../apps/MusicPlayer'
import VideoPlayer from '../apps/VideoPlayer'
import Settings from '../apps/Settings'
import BaiduMap from '../apps/BaiduMap'
import PQINA from '../apps/PQINA'
import PS from '../apps/PS'

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
}

const APP_LIST: IApp[] = [
  {
    id: APP_ID_MAP.fileExplorer,
    runningId: 0,
    title: '文件管理器',
    icon: iconFileExplorer,
    AppComponent: FileExplorer,
    width: 960,
    height: 640,
    resizeRange: {
      minWidth: 640,
      minHeight: 480,
    },
  },
  {
    id: APP_ID_MAP.transfer,
    runningId: 0,
    title: '传输助手',
    icon: iconTransfer,
    AppComponent: Transfer,
    width: 400,
    height: 400,
    resizeRange: {
      minWidth: 400,
      minHeight: 400,
      maxWidth: 400,
    },
  },
  {
    id: APP_ID_MAP.textEditor,
    runningId: 0,
    title: '文本编辑器',
    icon: iconTextEditor,
    AppComponent: TextEditor,
    width: 640,
    height: 480,
    resizeRange: {
      minWidth: 240,
      minHeight: 100,
    },
    matchList: ['txt', 'md', 'html', 'xml', 'css', 'js', 'json', 'php', 'java', 'sh', 'log', 'md'],
  },
  {
    id: APP_ID_MAP.photoGallery,
    runningId: 0,
    title: '图片查看器',
    icon: iconPhotoGallery,
    AppComponent: PhotoGallery,
    width: 640,
    height: 480,
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
    icon: iconMusicPlayer,
    AppComponent: MusicPlayer,
    width: 400,
    height: 200,
    resizeRange: {
      maxWidth: 400,
      maxHeight: 800,
      minWidth: 400,
      minHeight: 200,
    },
    bgImg: bgMusic,
    matchList: ['mp3', 'aac', 'flac'],
  },
  {
    id: APP_ID_MAP.videoPlayer,
    runningId: 0,
    title: '视频播放器',
    icon: iconVideoPlayer,
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
    icon: iconSettings,
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
    icon: iconBaiduMap,
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
    icon: iconPQINA,
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
    icon: iconPS,
    AppComponent: PS,
    width: 1000,
    height: 800,
    resizeRange: {
      minWidth: 800,
      minHeight: 600,
    },
  },
]

export const CALLABLE_APP_LIST = APP_LIST.filter(app => !!app.matchList)

export default APP_LIST
