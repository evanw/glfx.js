////////////////////////////////////////////////////////////////////////////////
// Filter object
////////////////////////////////////////////////////////////////////////////////

function Filter(name, func, init, update) {
    this.name = name;
    this.func = func;
    this.update = update;
    this.sliders = [];
    this.nubs = [];
    init.call(this);
}

Filter.prototype.addNub = function(name, x, y) {
    this.nubs.push({ name: name, x: x, y: y });
};

Filter.prototype.addSlider = function(name, label, min, max, value, step) {
    this.sliders.push({ name: name, label: label, min: min, max: max, value: value, step: step });
};

Filter.prototype.setCode = function(code) {
    $('#code').html(code);
    eval(code);
};

Filter.prototype.use = function() {
    // Clear all rows but the first two (which contain the filter selector and code sample)
    var tbody = $('#properties')[0].firstChild;
    for (var tr = tbody.firstChild.nextSibling.nextSibling; tr; tr = next) {
        var next = tr.nextSibling;
        tbody.removeChild(tr);
    }

    // Add a row for each slider
    for (var i = 0; i < this.sliders.length; i++) {
        var slider = this.sliders[i];
        $('<tr><th>' + slider.label + ':</th><td><div id="slider' + i + '"></div></td></tr>').appendTo(tbody);
        var onchange = (function(this_, slider) { return function(event, ui) {
            this_[slider.name] = ui.value;
            this_.update();
        }; })(this, slider);
        $('#slider' + i).slider({
            slide: onchange,
            change: onchange,
            min: slider.min,
            max: slider.max,
            value: slider.value,
            step: slider.step
        });
        this[slider.name] = slider.value;
    }

    // Add a div for each nub
    $('#nubs').html('');
    for (var i = 0; i < this.nubs.length; i++) {
        var nub = this.nubs[i];
        var x = nub.x * canvas.width;
        var y = nub.y * canvas.height;
        $('<div class="nub" id="nub' + i + '"></div>').appendTo('#nubs');
        var ondrag = (function(this_, nub) { return function(event, ui) {
            var offset = $(event.target.parentNode).offset();
            this_[nub.name] = { x: ui.offset.left - offset.left, y: ui.offset.top - offset.top };
            this_.update();
        }; })(this, nub);
        $('#nub' + i).draggable({
            drag: ondrag,
            containment: 'parent',
            scroll: false
        }).css({ left: x, top: y });
        this[nub.name] = { x: x, y: y };
    }

    // Provide a link to the documentation
    $('<tr><th></th><td><br>See the documentation for <kbd><a href="/glfx.js/docs/#' + this.func + '">' + this.func + '()</a></kbd> for more information.</td></tr>').appendTo(tbody);

    this.update();
};

////////////////////////////////////////////////////////////////////////////////
// Initialization code
////////////////////////////////////////////////////////////////////////////////

var canvas;
var texture;

function init(image) {
    var placeholder = document.getElementById('placeholder');

    // Try to get a WebGL canvas
    try {
        canvas = fx.canvas();
    } catch (e) {
        placeholder.innerHTML = e;
        return;
    }

    // Create a texture from the image and draw it to the canvas
    texture = canvas.texture(image);
    canvas.draw(texture).update().replace(placeholder);

    // Create the filter selector
    var html = '';
    for (var category in filters) {
        var list = filters[category];
        html += '<option disabled="true">---- ' + category + ' -----</option>';
        for (var i = 0; i < list.length; i++) {
            html += '<option>' + list[i].name + '</option>';
        }
    }
    $('#filters').html(html);

    // Call use() on the currently selected filter when the selection is changed
    var select = $('#filters')[0];
    function switchToFilter(index) {
        if (select.selectedIndex != index) select.selectedIndex = index;
        for (var category in filters) {
            index--;
            var list = filters[category];
            for (var i = 0; i < list.length; i++) {
                if (index-- == 0) list[i].use();
            }
        }
    }
    $('#filters').change(function() {
        switchToFilter(select.selectedIndex);
    });
    switchToFilter(1);

    // Allow the URL hash to jump to a specific demo
    var hash;
    function checkHash() {
        if (location.hash == hash) return;
        hash = location.hash;
        var index = 0;
        for (var category in filters) {
            index++;
            var list = filters[category];
            for (var i = 0; i < list.length; i++) {
                if ('#' + list[i].func == hash) {
                    switchToFilter(index);
                    break;
                }
                index++;
            }
        }
    }
    checkHash();
    setInterval(checkHash, 100);
}

$(window).load(function() {
    var image = new Image();
    image.onload = function() {
        init(image);
    };
    image.src = '/glfx.js/media/image.jpg';
});

////////////////////////////////////////////////////////////////////////////////
// Filter definitions
////////////////////////////////////////////////////////////////////////////////

var filters = {
    'Adjust': [
        new Filter('Brightness / Contrast', 'brightnessContrast', function() {
            this.addSlider('brightness', 'Brightness', -1, 1, 0, 0.01);
            this.addSlider('contrast', 'Contrast', -1, 1, 0, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).brightnessContrast(' + this.brightness + ', ' + this.contrast + ').update();');
        }),
        new Filter('Hue / Saturation', 'hueSaturation', function() {
            this.addSlider('hue', 'Hue', -1, 1, 0, 0.01);
            this.addSlider('saturation', 'Saturation', -1, 1, 0, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).hueSaturation(' + this.hue + ', ' + this.saturation + ').update();');
        })
    ],
    'Blur': [
        new Filter('Zoom Blur', 'zoomBlur', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('strength', 'Strength', 0, 1, 0.3, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).zoomBlur(' + this.center.x + ', ' + this.center.y + ', ' + this.strength + ').update();');
        }),
        new Filter('Triangle Blur', 'triangleBlur', function() {
            this.addSlider('radius', 'Radius', 0, 200, 50, 1);
        }, function() {
            this.setCode('canvas.draw(texture).triangleBlur(' + this.radius + ').update();');
        }),
        new Filter('Tilt Shift', 'tiltShift', function() {
            this.addNub('start', 0.15, 0.75);
            this.addNub('end', 0.75, 0.6);
            this.addSlider('blurRadius', 'Blur Radius', 0, 50, 15, 1);
            this.addSlider('gradientRadius', 'Gradient Radius', 0, 400, 200, 1);
        }, function() {
            this.setCode('canvas.draw(texture).tiltShift(' + this.start.x + ', ' + this.start.y + ', ' + this.end.x + ', ' + this.end.y + ', ' + this.blurRadius + ', ' + this.gradientRadius + ').update();');
        }),
        new Filter('Lens Blur', 'lensBlur', function() {
            this.addSlider('radius', 'Radius', 0, 20, 10, 1);
        }, function() {
            this.setCode('canvas.draw(texture).lensBlur(' + this.radius + ').update();');
        })
    ],
    'Warp': [
        new Filter('Swirl', 'swirl', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('angle', 'Angle', -25, 25, 3, 0.1);
            this.addSlider('radius', 'Radius', 0, 600, 200, 1);
        }, function() {
            this.setCode('canvas.draw(texture).swirl(' + this.center.x + ', ' + this.center.y + ', ' + this.radius + ', ' + this.angle + ').update();');
        }),
        new Filter('Bulge / Pinch', 'bulgePinch', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('strength', 'Strength', -1, 1, 0.5, 0.01);
            this.addSlider('radius', 'Radius', 0, 600, 200, 1);
        }, function() {
            this.setCode('canvas.draw(texture).bulgePinch(' + this.center.x + ', ' + this.center.y + ', ' + this.radius + ', ' + this.strength + ').update();');
        }),
        new Filter('Perspective', 'perspective', function() {
            this.addNub('a', 0.25, 0.25);
            this.addNub('b', 0.75, 0.25);
            this.addNub('c', 0.25, 0.75);
            this.addNub('d', 0.75, 0.75);
        }, function() {
            var xmin = canvas.width * 0.25, ymin = canvas.height * 0.25;
            var xmax = canvas.width * 0.75, ymax = canvas.height * 0.75;
            var before = [xmin, ymin, xmax, ymin, xmin, ymax, xmax, ymax];
            var after = [this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y, this.d.x, this.d.y];
            this.setCode('canvas.draw(texture).perspective([' + before + '], [' + after + ']).update();');
        })
    ],
    'Fun': [
        new Filter('Ink', 'ink', function() {
            this.addSlider('strength', 'Strength', 0, 1, 0.25, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).ink(' + this.strength + ').update();');
        }),
        new Filter('Hexagonal Pixelate', 'hexagonalPixelate', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('scale', 'Scale', 10, 100, 20, 1);
        }, function() {
            this.setCode('canvas.draw(texture).hexagonalPixelate(' + this.center.x + ', ' + this.center.y + ', ' + this.scale + ').update();');
        }),
        new Filter('Dot Screen', 'dotScreen', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('angle', 'Angle', 0, Math.PI / 2, 1.1, 0.01);
            this.addSlider('size', 'Size', 3, 20, 3, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).dotScreen(' + this.center.x + ', ' + this.center.y + ', ' + this.angle + ', ' + this.size + ').update();');
        }),
        new Filter('Color Halftone', 'colorHalftone', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('angle', 'Angle', 0, Math.PI / 2, 1.1, 0.01);
            this.addSlider('size', 'Size', 3, 20, 4, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).colorHalftone(' + this.center.x + ', ' + this.center.y + ', ' + this.angle + ', ' + this.size + ').update();');
        })
    ]
};
