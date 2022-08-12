export const USERNAME = process.env.USER
export const IS_DEV = process.env.NODE_ENV === 'development'

// sync back and front
export const GEN_THUMBNAIL_VIDEO_LIST = ['mp4', 'mkv', 'avi', 'rm', 'rmvb']
export const GEN_THUMBNAIL_IMAGE_LIST = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pbm', 'bmp']
export const GEN_THUMBNAIL_LIST = [
  ...GEN_THUMBNAIL_VIDEO_LIST,
  ...GEN_THUMBNAIL_IMAGE_LIST,
]
