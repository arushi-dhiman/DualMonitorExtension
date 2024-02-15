
let monitorArray = [];


function isDisplayContinuous(arr) {
    var indexIdArray = arr.map(obj => obj.indexId);
    const intArr = indexIdArray.map(str => parseInt(str, 10));
    intArr.sort();
    for (var i = 1; i < intArr.length; i++) {
        if (intArr[i] !== (intArr[i - 1] + 1)) {
            return false;
        }
    }
    return true;
}


// Event on save button click 
function AddEventOnSaveBtn() {
    const saveBtn = document.getElementById('btnSave');
    saveBtn.addEventListener('click', () => {
        if (monitorArray.length !== 0) {
            if (monitorArray.length > 1) {
                if (isDisplayContinuous(monitorArray) === true) {

                    chrome.system.display.getInfo(function (displayInfo) {
                        const displayIndices = monitorArray.map(item => item.displayId)
                        const fiterDisplayInfo = displayInfo.filter(item => displayIndices.includes(item.id))
                        console.log(fiterDisplayInfo, 'select display')
                        for (let i = 0; i < fiterDisplayInfo.length - 1; i++) {
                            if (fiterDisplayInfo[i].bounds.width !== fiterDisplayInfo[i + 1].bounds.width || fiterDisplayInfo[i].bounds.height !== fiterDisplayInfo[i + 1].bounds.height) {
                                document.getElementById('warningToaster').innerHTML = 'Mismatched screen resolutions may result in improper extended display functionality.';
                                clearToasterMessage('warningToaster');
                            }
                        }
                    })

                    SetDataChromeStorage();
                    document.getElementById('successToaster').innerHTML = 'Display settings saved successfully.'
                    clearToasterMessage('successToaster');
                }
                else {
                    document.getElementById('correctOrderToaster').innerHTML = 'Please select continuous data';
                    clearToasterMessage('correctOrderToaster');
                }
            }
            else {
                SetDataChromeStorage();
                document.getElementById('successToaster').innerHTML = 'Display settings saved successfully.'
                clearToasterMessage('successToaster');
            }
        }
        else {
            document.getElementById('warningToaster').innerHTML = 'Please select atleast one display';
            clearToasterMessage('warningToaster');
        }
    });

}

// Function to maintian Display Array 
function createClickHandler(objectId) {
    var index = monitorArray.findIndex(obj => obj.indexId === objectId.indexId);
    if (index === -1) {
        monitorArray.push(objectId);
    } else {
        monitorArray.splice(index, 1);
    }
    console.log('monitor array', monitorArray);
}

//Add style of Div selection
function updateDivStyles() {
    let container = document.getElementById('container');

    for (var i = 0; i < container.children.length; i++) {
        const div = container.children[i];
        var divId = parseInt(div.id, 10);
         

        // Check if the div's id is in clickedDivIds array
        var isSelected = monitorArray.findIndex(obj => obj.displayId == divId) != -1; 

        // Update styles based on selection
        if (isSelected) {
            div.style.backgroundColor = 'rgb(183, 235, 201)';
            div.style.border = '2px solid  #008000'

        } else {
            div.style.backgroundColor = '';
            div.style.border = ''
        }
    }
}


//Show Display Div in UI 
function ShowDisplayDiv(displayInfo) {
    let container = document.getElementById('container');
    var numberOfDivs = displayInfo.length;

    for (var i = 0; i < numberOfDivs; i++) {
        var newDiv = document.createElement('div');
        newDiv.className = 'wrapper';
        newDiv.id = displayInfo[i].id

        const objectId = {
            displayId: newDiv.id,
            indexId: (i + 1)
        }


        newDiv.innerHTML = `
        <h4><b>Display</b> ${i + 1}</h4>
        <p><b>ID</b> : ${displayInfo[i].id}<br>
            <b>Name</b> : ${displayInfo[i].name}<br>
            <b>Size</b> : ${displayInfo[i].bounds.width}*${displayInfo[i].bounds.height}<br>
            <b>Position</b> : ${displayInfo[i].bounds.left}*${displayInfo[i].bounds.top}<br>
            <b>Primary</b>: ${displayInfo[i].isPrimary}<br>
        </p>
        `;

        newDiv.onclick = function () {
            createClickHandler(objectId);
            updateDivStyles();
        }

        container.appendChild(newDiv);
        updateDivStyles();
    }

}
function CloseButton() {
    document.getElementById('closeButton').addEventListener('click', function () {
        window.close();
    })
}

function SetDataChromeStorage() {
    chrome.storage.sync.set({
        selectedDisplays: monitorArray
    }, function () {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        }
    });
}
function ClearSettings() {
    document.getElementById('clearSettingsButton').addEventListener('click', function () {
        monitorArray.splice(0, monitorArray.length)
        SetDataChromeStorage();
        updateDivStyles();
        document.getElementById('successToaster').innerHTML = 'Display settings cleared successfully.'
        clearToasterMessage('successToaster');
    })

}

function clearToasterMessage(name) {
    setTimeout(() => { document.getElementById(name).innerHTML = '' }, 3000);
}
function IdentifyButton() {
    document.getElementById('identifyButton').addEventListener('click', function () {
        chrome.system.display.getInfo(displayInfo => {
            displayInfo.forEach((display, index) => {
                chrome.windows.create({
                    type: 'popup',
                    width: 200,
                    height: 120,
                    left: display.bounds.left + 50,
                    top: display.bounds.top + 50,
                    url: 'IdentifyPopup.html?displayNo=' + (index + 1)
                }, (window) => {
                    setTimeout(() => {
                        chrome.windows.remove(window.id)
                    }, 3000)
                });

            });

        })


    })
}
function CheckForUserState() {
    chrome.storage.sync.get('selectedDisplays', (storage) => {
        console.log('selectedDisplays', storage)
        if (storage != undefined && storage != null && storage.selectedDisplays != undefined && storage.selectedDisplays != null && storage.selectedDisplays.length>0) {
            monitorArray = storage.selectedDisplays

        }
    });
}

//*************** Main **************/
document.addEventListener('DOMContentLoaded', function () {

    
    CheckForUserState()
    AddEventOnSaveBtn();
    ClearSettings();
    IdentifyButton();
    CloseButton();
    //Show display div 
    chrome.system.display.getInfo(ShowDisplayDiv);


});
