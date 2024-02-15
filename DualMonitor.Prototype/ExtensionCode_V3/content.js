

window.onload=addEventForScreenSetting('load');

const targetNode = document.body;
let IsChangeDetected=false;
function executeOnDOMChange(mutationlist,observer){

   observer.disconnect();
    addEventForScreenSetting('dom change');
    observer.observe(targetNode,observerConfig);
}

const observer =new MutationObserver(executeOnDOMChange)

const observerConfig={attributes:true,childList:true,subtree:true};
observer.observe(targetNode,observerConfig);

function addEventForScreenSetting(source) {
    

    let screenInfo = {
        left: window.screen.availLeft,
        top: window.screen.availLeft,
        width: window.screen.width,
        height: window.screen.height,
    }
    const customLinks=document.getElementsByTagName('a');
    Array.from(customLinks).forEach((link)=>{
       
        if (link.getAttribute('action-secondary-screen') === "true" && !link.hasAttribute('data-event-listener-added')) {
            console.log('source', source)
            link.setAttribute('data-event-listener-added', 'true'); // Mark the element to avoid duplication
            link.addEventListener('click', function customChangeScreenHandler(event) {
                event.preventDefault();
                chrome.runtime.sendMessage({
                    customChangeScreen: link.href,
                    screenInfo: screenInfo
                });
            });
        }
      });
}
  