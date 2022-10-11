import { SvgIcon } from '../../../components/base'

export default function SysAbout() {
  return (
    <>
      <div className="">
        <a
          href="https://gagu.io"
          target="_blank"
          rel="noreferrer"
        >
          <div className="gg-logo w-48 h-16" />
        </a>
        <a
          href="https://gagu.io"
          target="_blank"
          rel="noreferrer"
        >
          <SvgIcon.G
            className="inline-block mr-2"
            size={24}
          />
          <span className="text-xs">https://gagu.io</span>
        </a>
        <br />
        <a
          href="https://github.com/Chisw/gagu"
          target="_blank"
          rel="noreferrer"
        >
          <SvgIcon.Github
            className="inline-block mr-2"
            size={24}
          />
          <span className="text-xs">https://github.com/Chisw/gagu</span>
        </a>
      </div>
    </>
  )
}
