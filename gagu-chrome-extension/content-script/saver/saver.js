chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showSaver') {
    const { menuItemId, linkUrl, mediaType, srcUrl, selectionText, title, url } = request.message

    const div = document.createElement('div')
    div.setAttribute('class', 'io-gagu-saver-container')
    div.innerHTML = `
      <div class="container-header">
        ${linkUrl ? `<label for="io-gagu-saver-link">Link</label>` : ''}
        ${srcUrl ? `<label for="io-gagu-saver-image">Image</label>` : ''}
        ${selectionText ? `<label for="io-gagu-saver-text">Text</label>` : ''}
      </div>

      <div class="container-body">
        ${linkUrl ? `
          <input id="io-gagu-saver-link" type="radio" name="saver-type" value="link" />
          <div class="saver-type saver-link">
            <p>${linkUrl}</p>
          </div>
        ` : ''}

        ${srcUrl ? `
          <input id="io-gagu-saver-image" type="radio" name="saver-type" value="image" />
          <div class="saver-type saver-image">
            <img src="${srcUrl}" />
          </div>
        ` : ''}

        ${selectionText ? `
          <input id="io-gagu-saver-text" type="radio" name="saver-type" value="text" />
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

    div.querySelector('input[name="saver-type"]').checked = 'true'

    document.addEventListener('click', (e) => {
      if (e.target.className === 'cancel') {
        div.remove()
      }
    })
  }
})
