;(function() {
  const copy = (str) => {
    const input = document.createElement('textarea')
    document.body.appendChild(input)
    input.value = str
    input.select()
    document.execCommand('Copy')
    document.body.removeChild(input)
    input.remove()
  }

  document.querySelector('#refresh').addEventListener('click', () => {
    chrome.runtime.reload()
  })

  document.querySelector('#color-picker').addEventListener('click', async () => {
    try {
      const { sRGBHex } = await new EyeDropper().open()
      copy(sRGBHex)

      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../static/img/icon.png',
        title: 'ColorPicker',
        message: `Value copied: ${sRGBHex}`,
        priority: 0, // 优先级，0是默认，不会弹出强制用户交互
        // buttons: [{ title: '确定' }]
      });

      setTimeout(window.close, 200)
    } catch(e) {}
  })
}());
