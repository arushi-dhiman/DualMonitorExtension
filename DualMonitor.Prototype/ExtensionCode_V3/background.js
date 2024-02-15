

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.customChangeScreen != undefined && message.customChangeScreen != null) {
      chrome.storage.sync.get('selectedDisplays', (storage) => {
          console.log('enter into function', storage)
          OpenScreen(message.customChangeScreen, storage.selectedDisplays, message.screenInfo);
    });

  }
});


function CheckSourceAndDisplayIsOne(display, sourceInfo) {
    console.log('display', display);
    console.log('sourceInfo', sourceInfo);
    if (sourceInfo.left >= display.bounds.left && sourceInfo.left < (display.bounds.left+display.bounds.width)) {
        return true;
    } else {
        return false;
    }
}

function OpenScreen(url, selectedDisplays,screenInfo) {
    //Check for secondary screen availablity
    let displayIds = null;
    if (selectedDisplays != undefined && selectedDisplays != null) {
       let sortedDisplays= selectedDisplays.sort((a, b) => a.indexId - b.indexId)
        displayIds = sortedDisplays.map(item => { return item.displayId })
    }
    chrome.system.display.getInfo(displayInfo => {
        if (displayInfo.length > 1 && displayIds != null && displayIds != undefined && displayIds.length!=0) {

      if (displayIds.length == 1) {
        //get display Info
          let displayToOpen = displayInfo.find((display) => { return display.id == displayIds[0] })
          console.log('displayInfo', displayToOpen);

        // check if the selected screen is same as source screen if yes create tab 
          let IsOpenTab = CheckSourceAndDisplayIsOne(displayToOpen, screenInfo)
          console.log('IsOpenTab',IsOpenTab)
          if (IsOpenTab) {
              chrome.tabs.create({
                  url: url
              })

          } else {
              //Create new window and open url in other screen
              chrome.windows.create({
                  url: url,
                  type: 'normal',
                  left: displayToOpen.bounds.left,
                  top: displayToOpen.bounds.top,
                  focused: true,
                  state: "normal"
              }, (newWindow) => {
                  chrome.windows.update(newWindow.id, { state: 'maximized' })
              });

          }
      }
      else if (displayIds.length > 1) {

          let initialDisplay = displayInfo.find(display => { return display.id == displayIds[0] })

          


          //Create new window in first selected display
          chrome.windows.create({
            url: url,
            type: 'normal',
            left: initialDisplay.bounds.left,
            top: 0,
            focused: true
          }, (newWindow) => {

              chrome.windows.update(newWindow.id, { state: 'maximized' }, (updatedWindow) => {

                  let totalWidth = 0;
                  displayInfo.forEach((display) => {

                      //check if display is selected by user => if yes add in totalWidth
                      let displayFound = selectedDisplays.findIndex((item) => { return item.displayId == display.id });
                      if (displayFound != -1) {
                          totalWidth += display.bounds.width;
                      }
                  });
                  if (updatedWindow.left < initialDisplay.bounds.left) {
                      let leftDifference = initialDisplay.bounds.left - updatedWindow.left
                      
                      totalWidth += (2 * leftDifference);
                  }

                  chrome.windows.update(newWindow.id, { left: updatedWindow.left,  width: totalWidth,state:'normal' })
              })

           
          });
      }
        } else {
        //open in new tab
      chrome.tabs.create({
        url: url
      })
    }
  })

}


