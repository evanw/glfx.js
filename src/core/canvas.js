var gl;

function clamp(lo, value, hi) {
    return Math.max(lo, Math.min(value, hi));
}

function texture(image) {
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

function wrap(func) {
    return function() {
        // Make sure that we're using the correct global WebGL context
        gl = this._.gl;

        // Now that the context has been switched, we can call the wrapped function
        return func.apply(this, arguments);
    };
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
    canvas['texture'] = wrap(texture);
    canvas['draw'] = wrap(draw);
    canvas['update'] = wrap(update);
    canvas['replace'] = wrap(replace);
    canvas['brightnessContrast'] = wrap(brightnessContrast);
    canvas['hueSaturation'] = wrap(hueSaturation);
    canvas['perspective'] = wrap(perspective);
    canvas['matrixWarp'] = wrap(matrixWarp);
    canvas['bulgePinch'] = wrap(bulgePinch);
    canvas['dotScreen'] = wrap(dotScreen);
    canvas['zoomBlur'] = wrap(zoomBlur);
    canvas['swirl'] = wrap(swirl);
    canvas['ink'] = wrap(ink);
    return canvas;
};
