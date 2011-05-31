var fx = (function() {
var exports = {};

// src/core/canvas.js
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

// src/core/shader.js
var Shader = (function() {
    function isArray(obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    }

    function isNumber(obj) {
        return Object.prototype.toString.call(obj) == '[object Number]';
    }

    function compileSource(type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw 'compile error: ' + gl.getShaderInfoLog(shader);
        }
        return shader;
    }

    var defaultVertexSource = '\
    attribute vec2 vertex;\
    attribute vec2 _texCoord;\
    varying vec2 texCoord;\
    void main() {\
        texCoord = _texCoord;\
        gl_Position = vec4(vertex * 2.0 - 1.0, 0.0, 1.0);\
    }';

    var defaultFragmentSource = '\
    uniform sampler2D texture;\
    varying vec2 texCoord;\
    void main() {\
        gl_FragColor = texture2D(texture, texCoord);\
    }';

    function Shader(vertexSource, fragmentSource) {
        this.vertexAttribute = null;
        this.texCoordAttribute = null;
        this.program = gl.createProgram();
        this.isZombie = false;
        vertexSource = vertexSource || defaultVertexSource;
        fragmentSource = fragmentSource || defaultFragmentSource;
        fragmentSource = 'precision highp float;' + fragmentSource; // annoying requirement is annoying
        gl.attachShader(this.program, compileSource(gl.VERTEX_SHADER, vertexSource));
        gl.attachShader(this.program, compileSource(gl.FRAGMENT_SHADER, fragmentSource));
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            throw 'link error: ' + gl.getProgramInfoLog(this.program);
        }
    }

    Shader.prototype._delete = function() {
        gl.deleteProgram(this.program);
        this.program = null;
        this.isZombie = true;
    };

    Shader.prototype.uniforms = function(uniforms) {
        if (this.isZombie) throw 'attempted to use a shader after deleting it';
        gl.useProgram(this.program);
        for (var name in uniforms) {
            if (!uniforms.hasOwnProperty(name)) continue;
            var location = gl.getUniformLocation(this.program, name);
            if (location === null) continue; // will be null if the uniform isn't used in the shader
            var value = uniforms[name];
            if (isArray(value)) {
                switch (value.length) {
                    case 1: gl.uniform1fv(location, new Float32Array(value)); break;
                    case 2: gl.uniform2fv(location, new Float32Array(value)); break;
                    case 3: gl.uniform3fv(location, new Float32Array(value)); break;
                    case 4: gl.uniform4fv(location, new Float32Array(value)); break;
                    case 9: gl.uniformMatrix3fv(location, false, new Float32Array(value)); break;
                    case 16: gl.uniformMatrix4fv(location, false, new Float32Array(value)); break;
                    default: throw 'dont\'t know how to load uniform "' + name + '" of length ' + value.length;
                }
            } else if (isNumber(value)) {
                gl.uniform1f(location, value);
            } else {
                throw 'attempted to set uniform "' + name + '" to invalid value ' + (value || 'undefined').toString();
            }
        }
        // allow chaining
        return this;
    };

    // textures are uniforms too but for some reason can't be specified by gl.uniform1f,
    // even though floating point numbers represent the integers 0 through 7 exactly
    Shader.prototype.textures = function(textures) {
        if (this.isZombie) throw 'attempted to use a shader after deleting it';
        gl.useProgram(this.program);
        for (var name in textures) {
            if (!textures.hasOwnProperty(name)) continue;
            gl.uniform1i(gl.getUniformLocation(this.program, name), textures[name]);
        }
        // allow chaining
        return this;
    };

    var vertexBuffer = null;
    var texCoordBuffer = null;

    Shader.prototype.drawRect = function(left, top, right, bottom) {
        if (this.isZombie) throw 'attempted to use a shader after deleting it';
        var undefined;
        var viewport = gl.getParameter(gl.VIEWPORT);
        top = top !== undefined ? (top - viewport[1]) / viewport[3] : 0;
        left = left !== undefined ? (left - viewport[0]) / viewport[2] : 0;
        right = right !== undefined ? (right - viewport[0]) / viewport[2] : 1;
        bottom = bottom !== undefined ? (bottom - viewport[1]) / viewport[3] : 1;
        if (vertexBuffer == null) {
            vertexBuffer = gl.createBuffer();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ left, top, left, bottom, right, top, right, bottom ]), gl.STATIC_DRAW);
        if (texCoordBuffer == null) {
            texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 0, 0, 0, 1, 1, 0, 1, 1 ]), gl.STATIC_DRAW);
        }
        if (this.vertexAttribute == null) {
            this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
            gl.enableVertexAttribArray(this.vertexAttribute);
        }
        if (this.texCoordAttribute == null) {
            this.texCoordAttribute = gl.getAttribLocation(this.program, '_texCoord');
            gl.enableVertexAttribArray(this.texCoordAttribute);
        }
        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(this.vertexAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(this.texCoordAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    Shader.getDefaultShader = function() {
        gl.defaultShader = gl.defaultShader || new Shader();
        return gl.defaultShader;
    };

    return Shader;
})();

// src/core/texture.js
var Texture = (function() {
    function initTexture(texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture.id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    Texture.fromImage = function(image) {
        var texture = new Texture(image.width, image.height, gl.RGBA, gl.UNSIGNED_BYTE);
        initTexture(texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        return texture;
    };

    function Texture(width, height, format, type) {
        this.id = gl.createTexture();
        this.width = width;
        this.height = height;
        this.format = format;
        this.type = type;

        if (width && height) {
            initTexture(this);
            gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);
        }
    }

    Texture.prototype._delete = function() {
        gl.deleteTexture(this.id);
        this.id = null;
    };

    Texture.prototype.use = function(unit) {
        gl.activeTexture(gl.TEXTURE0 + (unit || 0));
        gl.bindTexture(gl.TEXTURE_2D, this.id);
    };

    var framebuffer = null;

    Texture.prototype.drawTo = function(callback) {
        // start rendering to this texture
        framebuffer = framebuffer || gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);
        gl.viewport(0, 0, this.width, this.height);

        // do the drawing
        callback();

        // stop rendering to this texture
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    var canvas = null;

    function getCanvas(texture) {
        if (canvas == null) canvas = document.createElement('canvas');
        canvas.width = texture.width;
        canvas.height = texture.height;
        var c = canvas.getContext('2d');
        c.clearRect(0, 0, canvas.width, canvas.height);
        return c;
    }

    Texture.prototype.fillUsingCanvas = function(callback) {
        callback(getCanvas(this));
        this.format = gl.RGBA;
        this.type = gl.UNSIGNED_BYTE;
        gl.bindTexture(gl.TEXTURE_2D, this.id);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        return this;
    };

    Texture.prototype.toImage = function(image) {
        this.use();
        Shader.getDefaultShader().drawRect();
        var size = this.width * this.height * 4;
        var pixels = new Uint8Array(size);
        var c = getCanvas(this);
        var data = c.createImageData(this.width, this.height);
        gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        for (var i = 0; i < size; i++) {
            data.data[i] = pixels[i];
        }
        c.putImageData(data, 0, 0);
        image.src = canvas.toDataURL();
    };

    Texture.prototype.swapWith = function(other) {
        var temp;
        temp = other.id; other.id = this.id; this.id = temp;
        temp = other.width; other.width = this.width; this.width = temp;
        temp = other.height; other.height = this.height; this.height = temp;
        temp = other.format; other.format = this.format; this.format = temp;
    };

    return Texture;
})();

// src/filters/adjust/brightnesscontrast.js
function brightnessContrast(brightness, contrast) {
    gl.brightnessContrast = gl.brightnessContrast || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float brightness;\
        uniform float contrast;\
        varying vec2 texCoord;\
        void main() {\
            vec3 color = texture2D(texture, texCoord).rgb;\
            color += brightness;\
            if (contrast > 0.0) {\
                color = (color - 0.5) / (1.0 - contrast) + 0.5;\
            } else {\
                color = (color - 0.5) * (1.0 + contrast) + 0.5;\
            }\
            gl_FragColor = vec4(color, 1.0);\
        }\
    ');

    simpleShader.call(this, gl.brightnessContrast, {
        brightness: clamp(-1, brightness, 1),
        contrast: clamp(-1, contrast, 1)
    });

    return this;
}

// src/filters/adjust/huesaturation.js
function hueSaturation(hue, saturation) {
    gl.hueSaturation = gl.hueSaturation || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float hue;\
        uniform float saturation;\
        varying vec2 texCoord;\
        void main() {\
            vec3 color = texture2D(texture, texCoord).rgb;\
            \
            /* hue adjustment, wolfram alpha: RotationTransform[angle, {1, 1, 1}][{x, y, z}] */\
            float angle = hue * 3.14159265;\
            float s = sin(angle), c = cos(angle);\
            vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;\
            float len = length(color);\
            color = vec3(\
                dot(color, weights.xyz),\
                dot(color, weights.zxy),\
                dot(color, weights.yzx)\
            );\
            \
            /* saturation adjustment */\
            float average = (color.x + color.y + color.z) / 3.0;\
            if (saturation > 0.0) {\
                color += (average - color) * (1.0 - 1.0 / (1.0 - saturation));\
            } else {\
                color += (average - color) * (-saturation);\
            }\
            \
            gl_FragColor = vec4(color, 1.0);\
        }\
    ');

    simpleShader.call(this, gl.hueSaturation, {
        hue: clamp(-1, hue, 1),
        saturation: clamp(-1, saturation, 1)
    });

    return this;
}

// src/filters/warp/bulgepinch.js
function bulgePinch(centerX, centerY, radius, strength) {
    gl.bulgePinch = gl.bulgePinch || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float radius;\
        uniform float strength;\
        uniform vec2 center;\
        uniform vec2 texSize;\
        varying vec2 texCoord;\
        void main() {\
            vec2 coord = texCoord * texSize;\
            coord -= center + 1.0;\
            float distance = length(coord);\
            if (distance < radius) {\
                float percent = distance / radius;\
                if (strength > 0.0) {\
                    coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);\
                } else {\
                    coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);\
                }\
            }\
            coord += center + 1.0;\
            gl_FragColor = texture2D(texture, coord / texSize);\
        }\
    ');

    simpleShader.call(this, gl.bulgePinch, {
        radius: radius,
        strength: strength,
        center: [centerX, centerY],
        texSize: [this.width, this.height]
    });

    return this;
}

// src/filters/warp/matrixwarp.js
function matrixWarp(matrix) {
    gl.matrixWarp = gl.matrixWarp || new Shader(null, '\
        uniform sampler2D texture;\
        uniform mat3 matrix;\
        uniform vec2 texSize;\
        varying vec2 texCoord;\
        void main() {\
            vec2 coord = texCoord * texSize;\
            vec3 warp = matrix * vec3(coord, 1.0);\
            coord = warp.xy / warp.z;\
            gl_FragColor = texture2D(texture, coord / texSize);\
        }\
    ');

    // Flatten all arguments into one big list
    matrix = Array.prototype.concat.apply([], arguments);

    // Extract a 4x4 matrix out of the arguments
    if (matrix.length == 4) {
        matrix = [
            matrix[0], matrix[2], 0,
            matrix[1], matrix[3], 0,
            0, 0, 1
        ];
    } else if (matrix.length == 9) {
        matrix = [
            matrix[0], matrix[3], matrix[6],
            matrix[1], matrix[4], matrix[7],
            matrix[2], matrix[5], matrix[8]
        ];
    } else {
        throw 'can only warp with 2x2 or 3x3 matrix';
    }

    simpleShader.call(this, gl.matrixWarp, {
        matrix: matrix,
        texSize: [this.width, this.height]
    });

    return this;
}

// src/filters/warp/perspective.js
function getSquareToQuad(x0, y0, x1, y1, x2, y2, x3, y3) {
    var dx1 = x1 - x2;
    var dy1 = y1 - y2;
    var dx2 = x3 - x2;
    var dy2 = y3 - y2;
    var dx3 = x0 - x1 + x2 - x3;
    var dy3 = y0 - y1 + y2 - y3;
    var m = {};
    var invdet = 1 / (dx1*dy2 - dx2*dy1);
    m.m20 = (dx3*dy2 - dx2*dy3)*invdet;
    m.m21 = (dx1*dy3 - dx3*dy1)*invdet;
    m.m22 = 1;
    m.m00 = x1 - x0 + m.m20*x1;
    m.m01 = x3 - x0 + m.m21*x3;
    m.m02 = x0;
    m.m10 = y1 - y0 + m.m20*y1;
    m.m11 = y3 - y0 + m.m21*y3;
    m.m12 = y0;
    return m;
}

function getAdjoint(m) {
    return {
        m00: m.m11*m.m22 - m.m12*m.m21,
        m10: m.m12*m.m20 - m.m10*m.m22,
        m20: m.m10*m.m21 - m.m11*m.m20,
        m01: m.m02*m.m21 - m.m01*m.m22,
        m11: m.m00*m.m22 - m.m02*m.m20,
        m21: m.m01*m.m20 - m.m00*m.m21,
        m02: m.m01*m.m12 - m.m02*m.m11,
        m12: m.m02*m.m10 - m.m00*m.m12,
        m22: m.m00*m.m11 - m.m01*m.m10
    };
}

function multiply(a, b) {
    return {
        m00: a.m00*b.m00 + a.m10*b.m01 + a.m20*b.m02,
        m10: a.m00*b.m10 + a.m10*b.m11 + a.m20*b.m12,
        m20: a.m00*b.m20 + a.m10*b.m21 + a.m20*b.m22,
        m01: a.m01*b.m00 + a.m11*b.m01 + a.m21*b.m02,
        m11: a.m01*b.m10 + a.m11*b.m11 + a.m21*b.m12,
        m21: a.m01*b.m20 + a.m11*b.m21 + a.m21*b.m22,
        m02: a.m02*b.m00 + a.m12*b.m01 + a.m22*b.m02,
        m12: a.m02*b.m10 + a.m12*b.m11 + a.m22*b.m12,
        m22: a.m02*b.m20 + a.m12*b.m21 + a.m22*b.m22
    };
}

function perspective(before, after) {
    var A = getSquareToQuad.apply(null, after);
    var B = getSquareToQuad.apply(null, before);
    var C = multiply(getAdjoint(A), B);
    return this.matrixWarp(
        C.m00, C.m01, C.m02,
        C.m10, C.m11, C.m12,
        C.m20, C.m21, C.m22
    );
}

// src/filters/warp/swirl.js
function swirl(centerX, centerY, radius, angle) {
    gl.swirl = gl.swirl || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float radius;\
        uniform float angle;\
        uniform vec2 center;\
        uniform vec2 texSize;\
        varying vec2 texCoord;\
        void main() {\
            vec2 coord = texCoord * texSize;\
            coord -= center;\
            float distance = length(coord);\
            if (distance < radius) {\
                float percent = (radius - distance) / radius;\
                float theta = percent * percent * angle;\
                float s = sin(theta);\
                float c = cos(theta);\
                coord = vec2(\
                    coord.x * c - coord.y * s,\
                    coord.x * s + coord.y * c\
                );\
            }\
            coord += center;\
            gl_FragColor = texture2D(texture, coord / texSize);\
        }\
    ');

    simpleShader.call(this, gl.swirl, {
        radius: radius,
        center: [centerX, centerY],
        angle: angle,
        texSize: [this.width, this.height]
    });

    return this;
}

return exports;
})();
