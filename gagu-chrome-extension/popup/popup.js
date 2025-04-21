;(function() {
  document.querySelector('#refresh').addEventListener('click', () => {
    chrome.runtime.reload()
  })
}());
