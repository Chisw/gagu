import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { FsApi } from '../../api'
import { getAbsolutePath } from '../../utils'
import { PhotoProvider, PhotoView } from 'react-photo-view'

export type MarkdownViewType = 'NONE' | 'HALF' | 'FULL'

interface MarkdownViewProps {
  content: string
  currentPath: string
}

export default function MarkdownView(props: MarkdownViewProps) {
  const {
    content,
    currentPath,
  } = props

  return (
    <>
      <div className="markdown-body p-4 min-w-[200px] min-h-full bg-white dark:bg-zinc-800">
        <PhotoProvider className="gagu-text-editor-photo-slider">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            children={content}
            components={{
              a(props) {
                return (
                  <a
                    {...props}
                    target="_blank"
                  >
                    {props.children}
                  </a>
                )
              },
              img(props) {
                const { src } = props
                const convertedSrc = src?.startsWith('http')
                  ? src
                  : FsApi.getPathStreamUrl(getAbsolutePath(currentPath, src || ''))
                
                return (
                  <PhotoView src={convertedSrc}>
                    <img
                      {...props}
                      alt={props.alt}
                      src={convertedSrc}
                    />
                  </PhotoView>
                )
              },
            }}
          />
        </PhotoProvider>
      </div>
    </>
  )
}
