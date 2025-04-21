chrome.contextMenus.create({
  id: 'gagu-save',
  title: 'Save',
  contexts: ['image', 'link', 'selection']
});

// chrome.contextMenus.create({
//   id: 'childMenu1',
//   parentId: 'gagu',
//   title: '选项1',
//   contexts: ['image']
// });

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  const { menuItemId, linkUrl, mediaType, srcUrl, selectionText } = info
  const { title, url } = tab

  console.log({ info, tab })

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'showSaver',
        message: { menuItemId, linkUrl, mediaType, srcUrl, selectionText, title, url },
      });
    }
  });

  // if (info.menuItemId === "searchSelected") {
  //   const searchText = info.selectionText;
  //   const url = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`;
  //   chrome.tabs.create({ url: url });
  // } else if (info.menuItemId === "saveImage") {
  //   console.log("用户想保存图片:", info.srcUrl);
  //   // 这里可以添加保存图片的逻辑
  // }
});
