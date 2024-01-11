const render = (inner: JSX.Element) => {
  return (props: {
    size?: number
    className?: string
  }) => {
    const { size = 16, className = '' } = props
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        fill="currentColor"
      >
        {inner}
      </svg>
    ) as JSX.Element
  }
}

export const SvgIcon = {
  Add: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" /></>),
  AddCircle: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M11 11V7h2v4h4v2h-4v4h-2v-4H7v-2h4zm1 11C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /></>),
  Android: render(<><path d="M6.38231 3.9681C7.92199 2.73647 9.87499 2 12 2C14.125 2 16.078 2.73647 17.6177 3.9681L19.0711 2.51472L20.4853 3.92893L19.0319 5.38231C20.2635 6.92199 21 8.87499 21 11V12H3V11C3 8.87499 3.73647 6.92199 4.9681 5.38231L3.51472 3.92893L4.92893 2.51472L6.38231 3.9681ZM3 14H21V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V14ZM9 9C9.55228 9 10 8.55228 10 8C10 7.44772 9.55228 7 9 7C8.44772 7 8 7.44772 8 8C8 8.55228 8.44772 9 9 9ZM15 9C15.5523 9 16 8.55228 16 8C16 7.44772 15.5523 7 15 7C14.4477 7 14 7.44772 14 8C14 8.55228 14.4477 9 15 9Z" fill="currentColor"></path></>),
  Apps: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M6.75 2.5A4.25 4.25 0 0 1 11 6.75V11H6.75a4.25 4.25 0 1 1 0-8.5zM9 9V6.75A2.25 2.25 0 1 0 6.75 9H9zm-2.25 4H11v4.25A4.25 4.25 0 1 1 6.75 13zm0 2A2.25 2.25 0 1 0 9 17.25V15H6.75zm10.5-12.5a4.25 4.25 0 1 1 0 8.5H13V6.75a4.25 4.25 0 0 1 4.25-4.25zm0 6.5A2.25 2.25 0 1 0 15 6.75V9h2.25zM13 13h4.25A4.25 4.25 0 1 1 13 17.25V13zm2 2v2.25A2.25 2.25 0 1 0 17.25 15H15z" /></>),
  Apple: render(<><path d="M11.6734 7.22198C10.7974 7.22198 9.44138 6.22598 8.01338 6.26198C6.12938 6.28598 4.40138 7.35397 3.42938 9.04597C1.47338 12.442 2.92538 17.458 4.83338 20.218C5.76938 21.562 6.87338 23.074 8.33738 23.026C9.74138 22.966 10.2694 22.114 11.9734 22.114C13.6654 22.114 14.1454 23.026 15.6334 22.99C17.1454 22.966 18.1054 21.622 19.0294 20.266C20.0974 18.706 20.5414 17.194 20.5654 17.11C20.5294 17.098 17.6254 15.982 17.5894 12.622C17.5654 9.81397 19.8814 8.46998 19.9894 8.40998C18.6694 6.47798 16.6414 6.26198 15.9334 6.21398C14.0854 6.06998 12.5374 7.22198 11.6734 7.22198ZM14.7934 4.38998C15.5734 3.45398 16.0894 2.14598 15.9454 0.849976C14.8294 0.897976 13.4854 1.59398 12.6814 2.52998C11.9614 3.35798 11.3374 4.68998 11.5054 5.96198C12.7414 6.05798 14.0134 5.32598 14.7934 4.38998Z" fill="currentColor"></path></>),
  ArrowDown: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M13 16.172l5.364-5.364 1.414 1.414L12 20l-7.778-7.778 1.414-1.414L11 16.172V4h2v12.172z" /></>),
  ArrowLeft: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z" /></>),
  ArrowRight: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" /></>),
  ArrowUp: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M13 7.828V20h-2V7.828l-5.364 5.364-1.414-1.414L12 4l7.778 7.778-1.414 1.414L13 7.828z" /></>),
  Avatar: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zM6.023 15.416C7.491 17.606 9.695 19 12.16 19c2.464 0 4.669-1.393 6.136-3.584A8.968 8.968 0 0 0 12.16 13a8.968 8.968 0 0 0-6.137 2.416zM12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></>),
  Battery: render(<><path d="M4 7v10h14V7H4zM3 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm18 4h2v6h-2V9z"/></>),
  Booklet: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M20.005 2C21.107 2 22 2.898 22 3.99v16.02c0 1.099-.893 1.99-1.995 1.99H4v-4H2v-2h2v-3H2v-2h2V8H2V6h2V2h16.005zM8 4H6v16h2V4zm12 0H10v16h10V4z"/></>),
  Brush: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M8 20v-5h2v5h9v-7H5v7h3zm-4-9h16V8h-6V4h-4v4H4v3zM3 21v-8H2V7a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3h5a1 1 0 0 1 1 1v6h-1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></>),
  Bulb: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M9.973 18H11v-5h2v5h1.027c.132-1.202.745-2.194 1.74-3.277.113-.122.832-.867.917-.973a6 6 0 1 0-9.37-.002c.086.107.807.853.918.974.996 1.084 1.609 2.076 1.741 3.278zM10 20v1h4v-1h-4zm-4.246-5a8 8 0 1 1 12.49.002C17.624 15.774 16 17 16 18.5V21a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.5C8 17 6.375 15.774 5.754 15z"/></>),
  Call: render(<><path d="M9.366 10.682a10.556 10.556 0 0 0 3.952 3.952l.884-1.238a1 1 0 0 1 1.294-.296 11.421 11.421 0 0 0 4.583 1.364 1 1 0 0 1 .921.997v4.462a1 1 0 0 1-.898.995c-.53.055-1.064.082-1.602.082C9.94 21 3 14.06 3 5.5c0-.538.027-1.072.082-1.602A1 1 0 0 1 4.077 3h4.462a1 1 0 0 1 .997.921A11.421 11.421 0 0 0 10.9 8.504a1 1 0 0 1-.296 1.294l-1.238.884zm-2.522-.657l1.9-1.357A13.41 13.41 0 0 1 7.647 5H5.01c-.006.166-.009.333-.009.5C5 12.956 11.044 19 18.5 19c.167 0 .334-.003.5-.01v-2.637a13.41 13.41 0 0 1-3.668-1.097l-1.357 1.9a12.45 12.45 0 0 1-1.588-.75l-.058-.033a12.556 12.556 0 0 1-4.702-4.702l-.033-.058a12.441 12.441 0 0 1-.75-1.588z"/></>),
  Camera: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M9.828 5l-2 2H4v12h16V7h-3.828l-2-2H9.828zM9 3h6l2 2h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4l2-2zm3 15a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0-2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></>),
  Check: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" /></>),
  CheckCircle: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-.997-4L6.76 11.757l1.414-1.414 2.829 2.829 5.656-5.657 1.415 1.414L11.003 16z"/></>),
  ChevronLeft: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z" /></>),
  ChevronRight: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" /></>),
  Close: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" /></>),
  CloseCircle: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z" /></>),
  CodeSlash: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M24 12l-5.657 5.657-1.414-1.414L21.172 12l-4.243-4.243 1.414-1.414L24 12zM2.828 12l4.243 4.243-1.414 1.414L0 12l5.657-5.657L7.07 7.757 2.828 12zm6.96 9H7.66l6.552-18h2.128L9.788 21z" /></>),
  CodeView: render(<><path d="M16.95 8.46451L18.3642 7.05029L23.3139 12L18.3642 16.9498L16.95 15.5356L20.4855 12L16.95 8.46451ZM7.05048 8.46451L3.51495 12L7.05048 15.5356L5.63627 16.9498L0.686523 12L5.63627 7.05029L7.05048 8.46451Z"></path></>),
  Contrast: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2V4a8 8 0 1 0 0 16z" /></>),
  Copy: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z" /></>),
  Dashboard: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M13 21V11h8v10h-8zM3 13V3h8v10H3zm6-2V5H5v6h4zM3 21v-6h8v6H3zm2-2h4v-2H5v2zm10 0h4v-6h-4v6zM13 3h8v6h-8V3zm2 2v2h4V5h-4z" /></>),
  Delete: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" /></>),
  Desktop: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M4 16h16V5H4v11zm9 2v2h4v2H7v-2h4v-2H2.992A.998.998 0 0 1 2 16.993V4.007C2 3.451 2.455 3 2.992 3h18.016c.548 0 .992.449.992 1.007v12.986c0 .556-.455 1.007-.992 1.007H13z"/></>),
  Device: render(<><path d="M19 8H21C21.5523 8 22 8.44772 22 9V21C22 21.5523 21.5523 22 21 22H13C12.4477 22 12 21.5523 12 21V20H4C3.44772 20 3 19.5523 3 19V3C3 2.44772 3.44772 2 4 2H18C18.5523 2 19 2.44772 19 3V8ZM17 8V4H5V18H12V9C12 8.44772 12.4477 8 13 8H17ZM14 10V20H20V10H14Z"></path></>),
  Download: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z" /></>),
  Earth: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M6.235 6.453a8 8 0 0 0 8.817 12.944c.115-.75-.137-1.47-.24-1.722-.23-.56-.988-1.517-2.253-2.844-.338-.355-.316-.628-.195-1.437l.013-.091c.082-.554.22-.882 2.085-1.178.948-.15 1.197.228 1.542.753l.116.172c.328.48.571.59.938.756.165.075.37.17.645.325.652.373.652.794.652 1.716v.105c0 .391-.038.735-.098 1.034a8.002 8.002 0 0 0-3.105-12.341c-.553.373-1.312.902-1.577 1.265-.135.185-.327 1.132-.95 1.21-.162.02-.381.006-.613-.009-.622-.04-1.472-.095-1.744.644-.173.468-.203 1.74.356 2.4.09.105.107.3.046.519-.08.287-.241.462-.292.498-.096-.056-.288-.279-.419-.43-.313-.365-.705-.82-1.211-.96-.184-.051-.386-.093-.583-.135-.549-.115-1.17-.246-1.315-.554-.106-.226-.105-.537-.105-.865 0-.417 0-.888-.204-1.345a1.276 1.276 0 0 0-.306-.43zM12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></>),
  Edit: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z" /></>),
  ExternalLink: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z"/></>),
  EyeOff: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M17.882 19.297A10.949 10.949 0 0 1 12 21c-5.392 0-9.878-3.88-10.819-9a10.982 10.982 0 0 1 3.34-6.066L1.392 2.808l1.415-1.415 19.799 19.8-1.415 1.414-3.31-3.31zM5.935 7.35A8.965 8.965 0 0 0 3.223 12a9.005 9.005 0 0 0 13.201 5.838l-2.028-2.028A4.5 4.5 0 0 1 8.19 9.604L5.935 7.35zm6.979 6.978l-3.242-3.242a2.5 2.5 0 0 0 3.241 3.241zm7.893 2.264l-1.431-1.43A8.935 8.935 0 0 0 20.777 12 9.005 9.005 0 0 0 9.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.947 10.947 0 0 1-2.012 4.592zm-9.084-9.084a4.5 4.5 0 0 1 4.769 4.769l-4.77-4.769z" /></>),
  Eye: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9C2.121 6.88 6.608 3 12 3zm0 16a9.005 9.005 0 0 0 8.777-7 9.005 9.005 0 0 0-17.554 0A9.005 9.005 0 0 0 12 19zm0-2.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /></>),
  Feedback: render(<><path d="M6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455ZM4 18.3851L5.76282 17H20V5H4V18.3851ZM11 13H13V15H11V13ZM11 7H13V12H11V7Z"></path></>),
  FileAdd: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M15 4H5v16h14V8h-4V4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0 1 20.007 22H3.993A1 1 0 0 1 3 21.008V2.992zM11 11V8h2v3h3v2h-3v3h-2v-3H8v-2h3z" /></>),
  File: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M21 8v12.993A1 1 0 0 1 20.007 22H3.993A.993.993 0 0 1 3 21.008V2.992C3 2.455 3.449 2 4.002 2h10.995L21 8zm-2 1h-5V4H5v16h14V9z" /></>),
  Filter: render(<><path fill="none" d="M0 0H24V24H0z" /><path d="M21 4v2h-1l-5 7.5V22H9v-8.5L4 6H3V4h18zM6.404 6L11 12.894V20h2v-7.106L17.596 6H6.404z" /></>),
  Flash: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M13 9h8L11 24v-9H4l9-15v9zm-2 2V7.22L7.532 13H13v4.394L17.263 11H11z"/></>),
  Folder: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M4 5v14h16V7h-8.414l-2-2H4zm8.414 0H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2z" /></>),
  FolderAdd: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 7V9h2v3h3v2h-3v3h-2v-3H8v-2h3z" /></>),
  FolderInfo: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 7h2v5h-2v-5zm0-3h2v2h-2V9z" /></>),
  FolderOpen: render(<><path d="M3 21C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5H20C20.5523 5 21 5.44772 21 6V9H19V7H11.5858L9.58579 5H4V16.998L5.5 11H22.5L20.1894 20.2425C20.0781 20.6877 19.6781 21 19.2192 21H3ZM19.9384 13H7.06155L5.56155 19H18.4384L19.9384 13Z"></path></>),
  FontLarge: render(<><path d="M4.15407 21.9167H2L9.60001 2.91667H11.6L19.2 21.9167H17.0459L14.6459 15.9167H6.55407L4.15407 21.9167ZM7.35407 13.9167H13.8459L10.6 5.80184L7.35407 13.9167Z" /><path d="M18.1829 4.5V2H19.0163V4.5H21.5163V5.33333H19.0163V7.83333H18.1829V5.33333H15.6829V4.5H18.1829Z" /></>),
  FontSmall: render(<><path d="M4.15407 22H2L9.60001 3H11.6L19.2 22H17.0459L14.6459 16H6.55407L4.15407 22ZM7.35407 14H13.8459L10.6 5.88517L7.35407 14Z" /><path d="M15.6829 4.58333V5.41667H21.5163V4.58333H15.6829Z" /></>),
  Forbid: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm4.891-11.477l-8.368 8.368a6.04 6.04 0 0 1-1.414-1.414l8.368-8.368a6.04 6.04 0 0 1 1.414 1.414z"/></>),
  FullscreenExit: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z" /></>),
  Fullscreen: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M20 3h2v6h-2V5h-4V3h4zM4 3h4v2H4v4H2V3h2zm16 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z" /></>),
  G: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M24 3H0V21H24V10.5H18V16.5H12V7.5H24V3Z" /></>),
  Github: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 2C6.475 2 2 6.475 2 12a9.994 9.994 0 0 0 6.838 9.488c.5.087.687-.213.687-.476 0-.237-.013-1.024-.013-1.862-2.512.463-3.162-.612-3.362-1.175-.113-.288-.6-1.175-1.025-1.413-.35-.187-.85-.65-.013-.662.788-.013 1.35.725 1.538 1.025.9 1.512 2.338 1.087 2.912.825.088-.65.35-1.087.638-1.337-2.225-.25-4.55-1.113-4.55-4.938 0-1.088.387-1.987 1.025-2.688-.1-.25-.45-1.275.1-2.65 0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337 1.912-1.3 2.75-1.024 2.75-1.024.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.688-4.562 4.938.362.312.675.912.675 1.85 0 1.337-.013 2.412-.013 2.75 0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10z" /></>),
  Global: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.29-2.333A17.9 17.9 0 0 1 8.027 13H4.062a8.008 8.008 0 0 0 5.648 6.667zM10.03 13c.151 2.439.848 4.73 1.97 6.752A15.905 15.905 0 0 0 13.97 13h-3.94zm9.908 0h-3.965a17.9 17.9 0 0 1-1.683 6.667A8.008 8.008 0 0 0 19.938 13zM4.062 11h3.965A17.9 17.9 0 0 1 9.71 4.333 8.008 8.008 0 0 0 4.062 11zm5.969 0h3.938A15.905 15.905 0 0 0 12 4.248 15.905 15.905 0 0 0 10.03 11zm4.259-6.667A17.9 17.9 0 0 1 15.973 11h3.965a8.008 8.008 0 0 0-5.648-6.667z"/></>),
  HardDrive: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M5 14h14V4H5v10zm0 2v4h14v-4H5zM4 2h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm11 15h2v2h-2v-2z" /></>),
  ImageAdd: render(<><path d="M21 15V18H24V20H21V23H19V20H16V18H19V15H21ZM21.0082 3C21.556 3 22 3.44495 22 3.9934V13H20V5H4V18.999L14 9L17 12V14.829L14 11.8284L6.827 19H14V21H2.9918C2.44405 21 2 20.5551 2 20.0066V3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082ZM8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7Z"></path></>),
  Info: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z" /></>),
  Key: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M10.758 11.828l7.849-7.849 1.414 1.414-1.414 1.415 2.474 2.474-1.414 1.415-2.475-2.475-1.414 1.414 2.121 2.121-1.414 1.415-2.121-2.122-2.192 2.192a5.002 5.002 0 0 1-7.708 6.294 5 5 0 0 1 6.294-7.708zm-.637 6.293A3 3 0 1 0 5.88 13.88a3 3 0 0 0 4.242 4.242z"/></>),
  Keyboard: render(<><path d="M4 5V19H20V5H4ZM3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM6 7H8V9H6V7ZM6 11H8V13H6V11ZM6 15H18V17H6V15ZM11 11H13V13H11V11ZM11 7H13V9H11V7ZM16 7H18V9H16V7ZM16 11H18V13H16V11Z" fill="currentColor"></path></>),
  Layout: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M3 21a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3zm4-11H4v9h3v-9zm13 0H9v9h11v-9zm0-5H4v3h16V5z"/></>),
  LayoutBottom: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M21 3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18zM4 16v3h16v-3H4zm0-2h16V5H4v9z" /></>),
  Links: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.071 7.071l.354-.354a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.354a5 5 0 0 0 0 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z" /></>),
  Linux: render(<><path d="M20.6781 18.7272C20.5703 18.4061 19.6328 18.003 19.3375 17.3585C19.0422 16.714 19.2836 16.3671 18.8289 16.0436C18.768 15.9991 18.7 15.9733 18.6273 15.9569C18.7867 15.5351 18.7914 14.9585 18.7703 14.1991C18.7164 12.214 17.8492 11.0233 17.3828 10.4421C16.825 9.74599 16.6328 9.48349 16.2039 8.80849C15.7891 8.15693 15.3484 7.35537 15.3344 6.49287C15.3156 5.47334 15.2805 4.30146 14.7977 3.41787C14.3148 2.53427 13.1148 1.6624 11.418 2.13115C9.60391 2.63271 9.55938 4.15849 9.47969 5.28584C9.4 6.41318 9.91328 7.21474 9.48203 8.63974C9.05078 10.0647 8.30078 10.5944 7.93984 11.3093C7.04688 13.0788 6.85703 13.2358 6.46563 14.1476C6.03203 15.153 6.35781 15.7483 6.35781 15.7483L6.37656 15.7976C6.22187 16.0835 6.13984 16.3694 5.95703 16.4468C5.59141 16.6015 4.72422 16.3671 4.42891 16.6624C4.13359 16.9577 4.57187 18.746 4.375 19.0765C4.17813 19.4069 4 19.3976 4 19.9343C4 20.471 4.59063 20.4171 6.89688 21.1952C9.20313 21.9733 9.63203 21.7577 10.1688 21.0874C10.2578 20.9772 10.3141 20.8554 10.3469 20.7265C11.0523 20.6632 11.7648 20.6069 12.1797 20.6046C13.1008 20.5999 14.3898 20.8905 14.9898 21.0382C15.0766 21.2702 15.2031 21.4577 15.3719 21.5444C15.8547 21.7858 16.982 21.7601 17.6523 21.1155C18.3227 20.471 20.0125 19.6413 20.2281 19.4257C20.4438 19.2101 20.7836 19.0483 20.6781 18.7272ZM11.0242 6.35224C10.9984 6.04756 10.832 5.81552 10.6516 5.82959C10.4711 5.84365 10.3445 6.10381 10.3703 6.40615C10.3844 6.5749 10.443 6.72256 10.5227 6.81631C10.4945 6.84209 10.4687 6.86552 10.443 6.88896C10.3117 6.71787 10.2016 6.44365 10.1734 6.10849C10.1242 5.52959 10.3492 5.0749 10.5836 5.05615H10.6C10.8273 5.05615 11.1156 5.45459 11.1625 6.02646C11.1719 6.14834 11.1695 6.26318 11.1602 6.37099C11.1156 6.38974 11.0711 6.41084 11.0289 6.43193C11.0266 6.40849 11.0266 6.38037 11.0242 6.35224ZM10.5766 6.76943L10.5742 6.77177C10.5742 6.76943 10.5742 6.76943 10.5766 6.76943ZM10.3516 6.96865C10.3656 6.95693 10.3773 6.94521 10.3914 6.93349C10.3773 6.94756 10.3656 6.95927 10.3516 6.96865ZM10.3984 6.92881C10.4125 6.91709 10.4266 6.90302 10.4406 6.89131C10.4266 6.90537 10.4125 6.91709 10.3984 6.92881ZM10.7828 7.48193C10.8414 7.43271 10.8977 7.38115 10.9516 7.33193C11.2023 7.10224 11.3711 6.96162 11.5961 6.95224C11.6219 6.9499 11.6477 6.9499 11.6734 6.9499C12.0555 6.9499 12.4422 7.08584 12.9672 7.40927C13.0141 7.4374 13.0586 7.46318 13.1008 7.48896C12.9836 7.59443 12.843 7.71631 12.6812 7.84756C12.3086 8.1499 12.032 8.3374 11.8891 8.41709C11.7836 8.37021 11.5914 8.26474 11.3055 8.06787C10.9938 7.85224 10.7547 7.65068 10.6938 7.58974C10.7172 7.55224 10.7477 7.5124 10.7828 7.48193ZM13.0328 6.67099C13.0445 6.67802 13.0586 6.68506 13.0703 6.69209C13.0586 6.68506 13.0469 6.67802 13.0328 6.67099ZM13.0727 5.78037C12.8477 5.76865 12.6344 6.01006 12.5969 6.31943C12.5898 6.36865 12.5898 6.41787 12.5945 6.4624C12.5078 6.42724 12.4211 6.39912 12.3367 6.37334C12.3273 6.27021 12.3273 6.1624 12.3414 6.05459C12.3742 5.77334 12.4844 5.51084 12.6461 5.32099C12.7914 5.15224 12.9602 5.05849 13.1219 5.05849H13.1453C13.2672 5.06552 13.3773 5.12412 13.4688 5.23427C13.6352 5.43115 13.7102 5.75224 13.6703 6.09209C13.6375 6.37334 13.5273 6.63584 13.3656 6.82568C13.3586 6.83271 13.3516 6.84209 13.3445 6.84912L13.3234 6.83506C13.2906 6.81396 13.2578 6.79521 13.225 6.77646C13.3234 6.67802 13.3937 6.53037 13.4148 6.36162C13.4477 6.05224 13.2977 5.79209 13.0727 5.78037ZM13.1664 6.74599C13.1523 6.73896 13.1383 6.72959 13.1242 6.72256C13.1406 6.72959 13.1547 6.73662 13.1664 6.74599ZM12.843 6.57256C12.8336 6.56787 12.8219 6.56318 12.8125 6.55849C12.8219 6.56318 12.8313 6.56787 12.843 6.57256ZM12.7516 6.53037C12.7422 6.52568 12.7352 6.52334 12.7258 6.51865C12.7352 6.52334 12.7445 6.52802 12.7516 6.53037ZM12.1984 6.34052C12.2008 6.34052 12.2031 6.34287 12.2078 6.34287C12.2031 6.34052 12.2008 6.34052 12.1984 6.34052ZM13.4055 6.88662C13.3844 6.8749 13.3633 6.86084 13.3422 6.84912C13.3633 6.86318 13.3844 6.8749 13.4055 6.88662ZM13.5648 6.97802C13.5531 6.97099 13.5391 6.96396 13.525 6.95693C13.5391 6.96396 13.5508 6.97099 13.5648 6.97802ZM14.2305 18.8515C13.8086 19.2358 13.4852 19.3952 13.2484 19.5452C12.8055 19.8265 12.0906 19.9976 11.3477 19.8851C10.8766 19.8147 10.4547 19.6179 10.0844 19.3952C9.99531 19.2218 9.90625 19.0811 9.84063 18.9968C9.67656 18.7788 8.56094 17.2015 7.8625 16.2171C7.825 16.0155 7.80625 15.8186 7.80859 15.6311C7.82266 14.478 8.14375 13.1304 8.40625 12.814C8.48594 12.7179 9.07188 11.0491 9.21016 10.6952C9.46563 10.0507 9.85938 9.29365 10.0656 8.85068C10.2063 8.48506 10.2273 8.22959 10.2086 8.05615C10.4406 8.29756 11.5281 9.11787 11.9172 9.11787H11.9242C12.2477 9.11084 13.4875 8.10068 13.9117 7.63662C13.9516 7.80537 14.1602 8.14052 14.2937 8.46396C14.6828 9.40615 15.1352 11.1686 15.8594 12.146C15.9086 12.214 16.0305 12.4436 16.0539 12.5327C16.3352 13.5429 16.2789 14.3069 16.1055 15.8069C16.0281 15.7811 15.9391 15.7601 15.8219 15.7507C15.3273 15.7108 15.1516 15.9124 15.1516 15.9124C15.1516 15.9124 15.1234 17.0233 15.0695 18.0522C15.0273 18.0991 14.9828 18.146 14.9383 18.1929C14.6852 18.446 14.4508 18.664 14.2305 18.8515Z" /></>),
  Loader: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M18.364 5.636L16.95 7.05A7 7 0 1 0 19 12h2a9 9 0 1 1-2.636-6.364z" /></>),
  Logout: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6v-3h-7v-2h7V8l5 4-5 4z" /></>),
  Markdown: render(<><path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM4 5V19H20V5H4ZM7 15.5H5V8.5H7L9 10.5L11 8.5H13V15.5H11V11.5L9 13.5L7 11.5V15.5ZM18 12.5H20L17 15.5L14 12.5H16V8.5H18V12.5Z"></path></>),
  MarkdownSolid: render(<><path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM7 15.5V11.5L9 13.5L11 11.5V15.5H13V8.5H11L9 10.5L7 8.5H5V15.5H7ZM18 12.5V8.5H16V12.5H14L17 15.5L20 12.5H18Z"></path></>),
  More: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M4.5 10.5c-.825 0-1.5.675-1.5 1.5s.675 1.5 1.5 1.5S6 12.825 6 12s-.675-1.5-1.5-1.5zm15 0c-.825 0-1.5.675-1.5 1.5s.675 1.5 1.5 1.5S21 12.825 21 12s-.675-1.5-1.5-1.5zm-7.5 0c-.825 0-1.5.675-1.5 1.5s.675 1.5 1.5 1.5 1.5-.675 1.5-1.5-.675-1.5-1.5-1.5z" /></>),
  MoveTo: render(<><path d="M12 11V8L16 12L12 16V13H8V11H12ZM12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20Z"></path></>),
  Pause: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M6 5h2v14H6V5zm10 0h2v14h-2V5z" /></>),
  Paint: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M5 5v3h14V5H5zM4 3h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 9h6a1 1 0 0 1 1 1v3h1v6h-4v-6h1v-2H5a1 1 0 0 1-1-1v-2h2v1zm11.732 1.732l1.768-1.768 1.768 1.768a2.5 2.5 0 1 1-3.536 0z"/></>),
  Planet: render(<><path d="M3.91762 8.0366C3.32984 9.23328 3 10.5792 3 11.9999C3 16.9704 7.02944 20.9999 12 20.9999C13.4216 20.9999 14.7684 20.6696 15.9657 20.081C16.8385 20.4544 17.6848 20.6991 18.4564 20.762C19.3582 20.8356 20.3 20.6665 20.9818 19.9847C21.7339 19.2325 21.8625 18.1689 21.7279 17.1727C21.6052 16.2638 21.2481 15.2537 20.726 14.2114C20.9051 13.503 21 12.7619 21 11.9999C21 7.02929 16.9706 2.99986 12 2.99986C11.2389 2.99986 10.4987 3.09454 9.79103 3.27318C8.7474 2.7498 7.73605 2.39172 6.8261 2.26834C5.82897 2.13315 4.76406 2.26128 4.01121 3.01413C3.3287 3.69664 3.16001 4.63956 3.2341 5.54233C3.29752 6.315 3.54313 7.16247 3.91762 8.0366ZM5.3224 5.96574C5.2734 5.75321 5.24204 5.55715 5.2274 5.37873C5.17928 4.79243 5.31727 4.53649 5.42543 4.42834C5.54452 4.30925 5.84797 4.15403 6.55739 4.25021C6.75482 4.27698 6.96951 4.32189 7.2 4.38547C6.50364 4.82527 5.87203 5.35784 5.3224 5.96574ZM19.6124 16.803C19.6751 17.0316 19.7195 17.2445 19.7459 17.4404C19.8416 18.1485 19.6865 18.4515 19.5676 18.5705C19.4595 18.6785 19.204 18.8163 18.6189 18.7686C18.4419 18.7542 18.2475 18.7233 18.0368 18.675C18.6427 18.1268 19.1736 17.4971 19.6124 16.803ZM15.8812 17.8264C14.2046 16.9482 12.2571 15.5026 10.3752 13.6207C8.4954 11.741 7.05092 9.79561 6.17241 8.12028C7.06357 6.78465 8.40124 5.77312 9.96933 5.29866C10.6108 5.10457 11.2923 4.99986 12 4.99986C15.866 4.99986 19 8.13386 19 11.9999C19 12.7083 18.8951 13.3904 18.7006 14.0325C18.2261 15.5991 17.2155 16.9356 15.8812 17.8264ZM13.6052 18.8152C13.0901 18.9359 12.5528 18.9999 12 18.9999C8.13401 18.9999 5 15.8658 5 11.9999C5 11.4476 5.06377 10.9109 5.18429 10.3963C6.14883 11.913 7.43475 13.5087 8.96096 15.0349C10.489 16.563 12.0868 17.8502 13.6052 18.8152Z"></path></>),
  Phone: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M7 4v16h10V4H7zM6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm6 15a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></>),
  Pin: render(<><path d="M11 17.9381C7.05369 17.446 4 14.0796 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 14.0796 16.9463 17.446 13 17.9381V20.0116C16.9463 20.1039 20 20.7351 20 21.5C20 22.3284 16.4183 23 12 23C7.58172 23 4 22.3284 4 21.5C4 20.7351 7.05369 20.1039 11 20.0116V17.9381ZM12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z"></path></>),
  Play: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M19.376 12.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z" /></>),
  PlayOrder: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M8 20v1.932a.5.5 0 0 1-.82.385l-4.12-3.433A.5.5 0 0 1 3.382 18H18a2 2 0 0 0 2-2V8h2v8a4 4 0 0 1-4 4H8zm8-16V2.068a.5.5 0 0 1 .82-.385l4.12 3.433a.5.5 0 0 1-.321.884H6a2 2 0 0 0-2 2v8H2V8a4 4 0 0 1 4-4h10z" /></>),
  PlayRandom: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M18 17.883V16l5 3-5 3v-2.09a9 9 0 0 1-6.997-5.365L11 14.54l-.003.006A9 9 0 0 1 2.725 20H2v-2h.725a7 7 0 0 0 6.434-4.243L9.912 12l-.753-1.757A7 7 0 0 0 2.725 6H2V4h.725a9 9 0 0 1 8.272 5.455L11 9.46l.003-.006A9 9 0 0 1 18 4.09V2l5 3-5 3V6.117a7 7 0 0 0-5.159 4.126L12.088 12l.753 1.757A7 7 0 0 0 18 17.883z" /></>),
  PlayRepeat: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M8 20v1.932a.5.5 0 0 1-.82.385l-4.12-3.433A.5.5 0 0 1 3.382 18H18a2 2 0 0 0 2-2V8h2v8a4 4 0 0 1-4 4H8zm8-16V2.068a.5.5 0 0 1 .82-.385l4.12 3.433a.5.5 0 0 1-.321.884H6a2 2 0 0 0-2 2v8H2V8a4 4 0 0 1 4-4h10zm-5 4h2v8h-2v-6H9V9l2-1z" /></>),
  PlayRewind: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 10.667l9.223-6.149a.5.5 0 0 1 .777.416v14.132a.5.5 0 0 1-.777.416L12 13.333v5.733a.5.5 0 0 1-.777.416L.624 12.416a.5.5 0 0 1 0-.832l10.599-7.066a.5.5 0 0 1 .777.416v5.733z" /></>),
  PlaySpeed: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 13.333l-9.223 6.149A.5.5 0 0 1 2 19.066V4.934a.5.5 0 0 1 .777-.416L12 10.667V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832l-10.599 7.066a.5.5 0 0 1-.777-.416v-5.733z" /></>),
  QrCode: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M16 17v-1h-3v-3h3v2h2v2h-1v2h-2v2h-2v-3h2v-1h1zm5 4h-4v-2h2v-2h2v4zM3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zM6 6h2v2H6V6zm0 10h2v2H6v-2zM16 6h2v2h-2V6z"/></>),
  Refresh: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M5.463 4.433A9.961 9.961 0 0 1 12 2c5.523 0 10 4.477 10 10 0 2.136-.67 4.116-1.81 5.74L17 12h3A8 8 0 0 0 6.46 6.228l-.997-1.795zm13.074 15.134A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.136.67-4.116 1.81-5.74L7 12H4a8 8 0 0 0 13.54 5.772l.997 1.795z" /></>),
  Rename: render(<><path d="M21 3C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H21ZM20 5H4V19H20V5ZM8 7V17H6V7H8Z"></path></>),
  Restart: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M18.537 19.567A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10c0 2.136-.67 4.116-1.81 5.74L17 12h3a8 8 0 1 0-2.46 5.772l.997 1.795z" /></>),
  Save: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M18 19h1V6.828L17.172 5H16v4H7V5H5v14h1v-7h12v7zM4 3h14l2.707 2.707a1 1 0 0 1 .293.707V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm4 11v5h8v-5H8z" /></>),
  Scan: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M21 16v5H3v-5h2v3h14v-3h2zM3 11h18v2H3v-2zm18-3h-2V5H5v3H3V3h18v5z"/></>),
  Settings: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M3.34 17a10.018 10.018 0 0 1-.978-2.326 3 3 0 0 0 .002-5.347A9.99 9.99 0 0 1 4.865 4.99a3 3 0 0 0 4.631-2.674 9.99 9.99 0 0 1 5.007.002 3 3 0 0 0 4.632 2.672c.579.59 1.093 1.261 1.525 2.01.433.749.757 1.53.978 2.326a3 3 0 0 0-.002 5.347 9.99 9.99 0 0 1-2.501 4.337 3 3 0 0 0-4.631 2.674 9.99 9.99 0 0 1-5.007-.002 3 3 0 0 0-4.632-2.672A10.018 10.018 0 0 1 3.34 17zm5.66.196a4.993 4.993 0 0 1 2.25 2.77c.499.047 1 .048 1.499.001A4.993 4.993 0 0 1 15 17.197a4.993 4.993 0 0 1 3.525-.565c.29-.408.54-.843.748-1.298A4.993 4.993 0 0 1 18 12c0-1.26.47-2.437 1.273-3.334a8.126 8.126 0 0 0-.75-1.298A4.993 4.993 0 0 1 15 6.804a4.993 4.993 0 0 1-2.25-2.77c-.499-.047-1-.048-1.499-.001A4.993 4.993 0 0 1 9 6.803a4.993 4.993 0 0 1-3.525.565 7.99 7.99 0 0 0-.748 1.298A4.993 4.993 0 0 1 6 12c0 1.26-.47 2.437-1.273 3.334a8.126 8.126 0 0 0 .75 1.298A4.993 4.993 0 0 1 9 17.196zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></>),
  Share: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M13.12 17.023l-4.199-2.29a4 4 0 1 1 0-5.465l4.2-2.29a4 4 0 1 1 .959 1.755l-4.2 2.29a4.008 4.008 0 0 1 0 1.954l4.199 2.29a4 4 0 1 1-.959 1.755zM6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></>),
  ShutDown: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M6.265 3.807l1.147 1.639a8 8 0 1 0 9.176 0l1.147-1.639A9.988 9.988 0 0 1 22 12c0 5.523-4.477 10-10 10S2 17.523 2 12a9.988 9.988 0 0 1 4.265-8.193zM11 12V2h2v10h-2z" /></>),
  SideBar: render(<><path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM8 5H4V19H8V5ZM10 5V19H20V5H10Z"></path></>),
  SkipBack: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M8 11.333l10.223-6.815a.5.5 0 0 1 .777.416v14.132a.5.5 0 0 1-.777.416L8 12.667V19a1 1 0 0 1-2 0V5a1 1 0 1 1 2 0v6.333z" /></>),
  SkipForward: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M16 12.667L5.777 19.482A.5.5 0 0 1 5 19.066V4.934a.5.5 0 0 1 .777-.416L16 11.333V5a1 1 0 0 1 2 0v14a1 1 0 0 1-2 0v-6.333z" /></>),
  Sort: render(<><path d="M20 4V16H23L19 21L15 16H18V4H20ZM12 18V20H3V18H12ZM14 11V13H3V11H14ZM14 4V6H3V4H14Z"></path></>),
  Star: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26zm0-2.292l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275l-2.038 4.42-4.833.572 3.573 3.305-.949 4.773L12 15.968z" /></>),
  StarSolid: render(<><path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"></path></>),
  Subtract: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M5 11h14v2H5z" /></>),
  SubtractCircle: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-5-9h10v2H7v-2z" /></>),
  Time: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8h4v2h-6V7h2v5z" /></>),
  Transfer: render(<><path d="M2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22C6.477 22 2 17.523 2 12ZM15 12V8H13L13 17L18 12H15ZM11 7L6 12H9L9 16H11L11 7Z" /></>),
  Upgrade: render(<><path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20ZM13 12V16H11V12H8L12 8L16 12H13Z"></path></>),
  Upload: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M3 19h18v2H3v-2zM13 5.828V17h-2V5.828L4.929 11.9l-1.414-1.414L12 2l8.485 8.485-1.414 1.414L13 5.83z" /></>),
  User: render(<><path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13Z" fill="currentColor"></path></>),
  Users: render(<><path fill="none" d="M0 0h24v24H0z"/><path d="M2 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm8.284 3.703A8.002 8.002 0 0 1 23 22h-2a6.001 6.001 0 0 0-3.537-5.473l.82-1.824zm-.688-11.29A5.5 5.5 0 0 1 21 8.5a5.499 5.499 0 0 1-5 5.478v-2.013a3.5 3.5 0 0 0 1.041-6.609l.555-1.943z"/></>),
  ViewGrid: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8zm2-8v4h4V5h-4zm0 10v4h4v-4h-4zM5 5v4h4V5H5zm0 10v4h4v-4H5z" /></>),
  ViewList: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M8 4h13v2H8V4zm-5-.5h3v3H3v-3zm0 7h3v3H3v-3zm0 7h3v3H3v-3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" /></>),
  VolumeMute: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M10 7.22L6.603 10H3v4h3.603L10 16.78V7.22zM5.889 16H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L5.89 16zm14.525-4l3.536 3.536-1.414 1.414L19 13.414l-3.536 3.536-1.414-1.414L17.586 12 14.05 8.464l1.414-1.414L19 10.586l3.536-3.536 1.414 1.414L20.414 12z" /></>),
  VolumeDown: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M13 7.22L9.603 10H6v4h3.603L13 16.78V7.22zM8.889 16H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L8.89 16zm9.974.591l-1.422-1.422A3.993 3.993 0 0 0 19 12c0-1.43-.75-2.685-1.88-3.392l1.439-1.439A5.991 5.991 0 0 1 21 12c0 1.842-.83 3.49-2.137 4.591z" /></>),
  VolumeUp: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M10 7.22L6.603 10H3v4h3.603L10 16.78V7.22zM5.889 16H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L5.89 16zm13.517 4.134l-1.416-1.416A8.978 8.978 0 0 0 21 12a8.982 8.982 0 0 0-3.304-6.968l1.42-1.42A10.976 10.976 0 0 1 23 12c0 3.223-1.386 6.122-3.594 8.134zm-3.543-3.543l-1.422-1.422A3.993 3.993 0 0 0 16 12c0-1.43-.75-2.685-1.88-3.392l1.439-1.439A5.991 5.991 0 0 1 18 12c0 1.842-.83 3.49-2.137 4.591z" /></>),
  Warning: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" /></>),
  Windows: render(<><path d="M3.00098 5.47902L10.3778 4.4625V11.5902H3.00098V5.47902ZM3.00098 18.521L10.3778 19.5375V12.4982H3.00098V18.521ZM11.1894 19.646L21.001 21V12.4982H11.1894V19.646ZM11.1894 4.35402V11.5902H21.001V3L11.1894 4.35402Z" fill="currentColor"></path></>),
  Zip: render(<><path fill="none" d="M0 0h24v24H0z" /><path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1zm-1-2V4H5v16h14zm-5-8v5h-4v-3h2v-2h2zm-2-8h2v2h-2V4zm-2 2h2v2h-2V6zm2 2h2v2h-2V8zm-2 2h2v2h-2v-2z" /></>),
}
