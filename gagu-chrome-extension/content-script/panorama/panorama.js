; (function (window) {

  const iconDownload = `<svg data-icon="circle-arrow-down" width="20" height="20" viewBox="0 0 20 20" fill="#fff"><path d="M14 10c-.28 0-.53.11-.71.29L11 12.59V5c0-.55-.45-1-1-1s-1 .45-1 1v7.59L6.71 10.3A.965.965 0 006 10a1.003 1.003 0 00-.71 1.71l4 4c.18.18.43.29.71.29s.53-.11.71-.29l4-4A1.003 1.003 0 0014 10zM10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill-rule="evenodd"></path></svg>`
  const iconDownloading = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><g transform="rotate(150 50 50)"><path d="M59.27050983124842 21.46830451114539 A30 30 0 0 1 80 49.99999999999999" fill="#fff" stroke="#dae4bf" stroke-width="14"/><animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" times="0;1" dur="1" repeatCount="indefinite"/></g></svg>`

  const getTilesByPID = pid => {
    const tiles = []
    for (let row = 0, rows = 4; row < rows; row++) {
      for (let col = 0, cols = 8; col < cols; col++) {
        tiles.push({
          row,
          col,
          src: `https://mapsv1.bdimg.com/?qt=pdata&sid=${pid}&pos=${row}_${col}&z=4`,
        })
      }
    }
    return tiles
  }

  window.addEventListener('load', () => {

    const {
      location,
      document,
    } = window

    const downloadBtn = document.createElement('a')
    downloadBtn.innerHTML = iconDownload
    downloadBtn.style = `
      display: none;
      position: absolute;
      z-index: 9999999;
      top: 0;
      right: 0;
      margin: 12px;
      padding: 10px;
      background: #595b63;
      font-size: 0;
      cursor: pointer;
    `
    document.body.appendChild(downloadBtn)

    const downloadHandler = async (pid) => {
      const tiles = getTilesByPID(pid)
      const canvas = document.createElement('canvas')
      canvas.width = 4096
      canvas.height = 2048
      const ctx = canvas.getContext('2d')

      tiles.forEach(({ row, col, src }) => {
        const img = document.createElement('img')
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
          ctx.drawImage(img, 512 * col, 512 * row, 512, 512)
        }
        img.src = src
      })

      await Promise.all(tiles.map(async ({ row, col, src }) => {
        await new Promise((resolve, reject) => {
          const img = document.createElement('img')
          img.crossOrigin = 'Anonymous'
          img.onload = () => {
            ctx.drawImage(img, 512 * col, 512 * row, 512, 512)
            resolve('success')
          }
          img.onerror = () => reject('fail')
          img.src = src
        })
      }))

      ctx.font = '24px monospace'
      ctx.textAlign = 'left'
      ctx.fillStyle = '#000'
      ctx.fillText(pid, 20, 2021)
      ctx.fillStyle = '#fff'
      ctx.fillText(pid, 20, 2020)

      const base64 = canvas.toDataURL('image/jpeg')
      const link = document.createElement('a')
      link.setAttribute('href', base64)
      link.setAttribute('download', `PANORAMA_${pid}.jpg`)
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))

    }

    const hashChangeHandler = () => {

      const ID_REG = /[0-9]{25}[0-9A-Z]{2}/g
      const matchRes = location.hash.match(ID_REG)

      if (matchRes) {
        downloadBtn.style.display = 'block'
        downloadBtn.onclick = () => {
          if (downloadBtn.style.cursor === 'wait') return
          downloadBtn.innerHTML = iconDownloading
          downloadBtn.style.cursor = 'wait'
          downloadHandler(matchRes[0])
          setTimeout(() => {
            downloadBtn.innerHTML = iconDownload
            downloadBtn.style.cursor = 'pointer'
          }, 1000)
        }
      } else {
        downloadBtn.style.display = 'none'
      }
    }

    hashChangeHandler()
    window.addEventListener('hashchange', hashChangeHandler)

  })

}(window));
