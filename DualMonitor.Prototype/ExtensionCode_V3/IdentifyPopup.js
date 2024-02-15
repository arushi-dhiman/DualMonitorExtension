
document.addEventListener('DOMContentLoaded', function() {

const urlParams=window.location.href.split('?')[1];
const displayNumber=urlParams.split('=')[1];
let displayLabel= document.getElementById('displayLabel');
displayLabel.textContent="Display : "+displayNumber;
});