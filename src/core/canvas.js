var gl;

function clamp(lo, value, hi) {
    return Math.max(lo, Math.min(value, hi));
}

function texture(image) {
    gl = this.gl;

    // Draw a 1px transparent border around the edge of the image
    var texture = new Texture(image.width + 2, image.height + 2, gl.RGBA, gl.UNSIGNED_BYTE);
    texture.fillUsingCanvas(function(c) {
        c.drawImage(image, 1, 1);
    });
    return { _: texture };
}

function initialize(width, height) {
    this.width = width;
    this.height = height;
    this._.texture = new Texture(width, height, gl.RGBA, gl.UNSIGNED_BYTE);
    this._.spareTexture = new Texture(width, height, gl.RGBA, gl.UNSIGNED_BYTE);
    this._.flippedShader = new Shader(null, '\
        uniform sampler2D texture;\
        uniform vec2 texSize;\
        varying vec2 texCoord;\
        void main() {\
            gl_FragColor = texture2D(texture, vec2(texCoord.x, 1.0 - texCoord.y) + 1.0 / texSize);\
        }\
    ');
    this._.isInitialized = true;
}

function draw(texture) {
    gl = this.gl;

    if (!this._.isInitialized) {
        initialize.call(this, texture._.width, texture._.height);
    }

    this._.texture.drawTo(function() {
        texture._.use();
        Shader.getDefaultShader().drawRect();
    });

    return this;
}

function update() {
    gl = this.gl;

    this._.texture.use();
    this._.flippedShader.uniforms({
        texSize: [this._.texture.width, this._.texture.height]
    }).drawRect();

    return this;
}

function simpleShader(shader, uniforms) {
    var texture = this._.texture;
    this._.spareTexture.drawTo(function() {
        texture.use();
        shader.uniforms(uniforms).drawRect();
    });
    this._.spareTexture.swapWith(texture);
}

function replace(node) {
    node.parentNode.insertBefore(this, node);
    node.parentNode.removeChild(node);
    return this;
}

exports['canvas'] = function() {
    var canvas = document.createElement('canvas');
    try {
        canvas.gl = canvas.getContext('experimental-webgl');
    } catch (e) {
        throw 'This browser does not support WebGL';
    }
    canvas._ = {
        isInitialized: false,
        texture: null,
        spareTexture: null
    };
    canvas['texture'] = texture;
    canvas['draw'] = draw;
    canvas['update'] = update;
    canvas['replace'] = replace;
    canvas['brightnessContrast'] = brightnessContrast;
    canvas['hueSaturation'] = hueSaturation;
    canvas['perspective'] = perspective;
    canvas['matrixWarp'] = matrixWarp;
    canvas['bulgePinch'] = bulgePinch;
    canvas['swirl'] = swirl;
    return canvas;
};
