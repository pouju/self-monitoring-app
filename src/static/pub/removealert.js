// script that remove succeed alert after 10 seconds

const removeAlertElem = document.querySelector('#succeedAlert');
setTimeout(function(){
    try {
        removeAlertElem.parentElement.removeChild(removeAlertElem);
    } catch (e) { /* catch error is user is already deleted alert */}
}, 10000);
