var gl;

function clamp(lo, value, hi) {
    return Math.max(lo, Math.min(value, hi));
}

function texture(image) {
    gl = this._.gl;
    return { _: Texture.fromImage(image) };
}

function initialize(width, height) {
    if (this._.texture) this._.texture.destroy();
    if (this._.spareTexture) this._.spareTexture.destroy();
    this.width = width;
    this.height = height;
    this._.texture = new Texture(width, height, gl.RGBA, gl.UNSIGNED_BYTE);
    this._.spareTexture = new Texture(width, height, gl.RGBA, gl.UNSIGNED_BYTE);
    this._.flippedShader = this._.flippedShader || new Shader(null, '\
        uniform sampler2D texture;\
        uniform vec2 texSize;\
        varying vec2 texCoord;\
        void main() {\
            gl_FragColor = texture2D(texture, vec2(texCoord.x, 1.0 - texCoord.y));\
        }\
    ');
    this._.isInitialized = true;
}

function draw(texture) {
    gl = this._.gl;

    if (!this._.isInitialized || texture._.width != this.width || texture._.height != this.height) {
        initialize.call(this, texture._.width, texture._.height);
    }

    this._.texture.drawTo(function() {
        texture._.use();
        Shader.getDefaultShader().drawRect();
    });

    return this;
}

function update() {
    gl = this._.gl;

    this._.texture.use();
    this._.flippedShader.uniforms({
        texSize: [this._.texture.width, this._.texture.height]
    }).drawRect();

    return this;
}

function simpleShader(shader, uniforms) {
    gl = this._.gl;

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
        gl = canvas.getContext('experimental-webgl');
    } catch (e) {
        gl = null;
    }
    if (!gl) {
        throw 'This browser does not support WebGL';
    }
    canvas._ = {
        gl: gl,
        isInitialized: false,
        texture: null,
        spareTexture: null,
        flippedShader: null
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
    canvas['dotScreen'] = dotScreen;
    canvas['zoomBlur'] = zoomBlur;
    canvas['swirl'] = swirl;
    canvas['ink'] = ink;
    return canvas;
};
