async function getImageSizeByDownload(url) {
  if (!url) return 0
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error('Error fetching image:', error);
    return 0;
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'showSaver') {
    const { menuItemId, linkUrl, mediaType, srcUrl, selectionText, title, url } = request.message

    const size = await getImageSizeByDownload(srcUrl)

    const div = document.createElement('div')
    div.setAttribute('class', 'gagu-saver-container')
    div.innerHTML = `
      <div class="container-header">
        Saver
      </div>

      <div class="container-body">
        ${linkUrl ? `
          <div>Link</div>
          <div class="saver-type saver-link">
            <p>${linkUrl}</p>
          </div>
        ` : ''}

        ${srcUrl ? `
          <divImage</div>
          <div class="saver-type saver-image">
            <img src="${srcUrl}"  />
            ${size}bytes
          </div>
        ` : ''}

        ${selectionText ? `
          <div>Text</div>
          <div class="saver-type saver-text">
            <textarea>
              ${selectionText}
            </textarea>
          </div> 
        ` : ''}
      </div>

      <div class="container-footer">
        <button class="cancel">Cancel</button>
        <button class="confirm">Confirm</button>
      </div>
    `
    document.body.append(div)


    document.addEventListener('click', (e) => {
      if (e.target.className === 'cancel') {
        div.remove()
      }
    })
  }
})
