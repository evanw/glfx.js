function init(image) {
    var placeholder = document.getElementById('placeholder');

    // Try to get a WebGL canvas
    try {
        var canvas = fx.canvas();
    } catch (e) {
        placeholder.innerHTML = e;
        return;
    }

    // Create a texture from the image and draw it to the canvas
    var texture = canvas.texture(image);
    canvas.draw(texture).update().replace(placeholder);

    // Draw a swirl under the mouse
    $(document).mousemove(function(e) {
        var offset = $(canvas).offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;
        canvas.draw(texture).swirl(x, y, 200, 4).update();
    });
}

$(window).load(function() {
    var image = new Image();
    image.onload = function() {
        init(image);
    };
    image.src = 'media/image.jpg';
});
