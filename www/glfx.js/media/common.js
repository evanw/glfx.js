// Fix onclick for the links, which gets messed up when the onmousedown
// and onmouseup events get called on different elements
$(document).ready(function() {
    $('.nav li').each(function(i, li) {
        $(li).mouseup(function() {
            window.location = li.firstChild.href;
        });
    });
});
