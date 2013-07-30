// From: https://github.com/evanw/OES_texture_float_linear-polyfill
(function() {
  // Uploads a 2x2 floating-point texture where one pixel is 2 and the other
  // three pixels are 0. Linear filtering is only supported if a sample taken
  // from the center of that texture is (2 + 0 + 0 + 0) / 4 = 0.5.
  function supportsOESTextureFloatLinear(gl) {
    // Need floating point textures in the first place
    if (!gl.getExtension('OES_texture_float')) {
      return false;
    }

    // Create a render target
    var framebuffer = gl.createFramebuffer();
    var byteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, byteTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, byteTexture, 0);

    // Create a simple floating-point texture with value of 0.5 in the center
    var rgba = [
      2, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0
    ];
    var floatTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, floatTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.FLOAT, new Float32Array(rgba));

    // Create the test shader
    var program = gl.createProgram();
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, '\
      attribute vec2 vertex;\
      void main() {\
        gl_Position = vec4(vertex, 0.0, 1.0);\
      }\
    ');
    gl.shaderSource(fragmentShader, '\
      uniform sampler2D texture;\
      void main() {\
        gl_FragColor = texture2D(texture, vec2(0.5));\
      }\
    ');
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Create a buffer containing a single point
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0]), gl.STREAM_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Render the point and read back the rendered pixel
    var pixel = new Uint8Array(4);
    gl.useProgram(program);
    gl.viewport(0, 0, 1, 1);
    gl.bindTexture(gl.TEXTURE_2D, floatTexture);
    gl.drawArrays(gl.POINTS, 0, 1);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    // The center sample will only have a value of 0.5 if linear filtering works
    return pixel[0] === 127 || pixel[0] === 128;
  }

  // The constructor for the returned extension object
  function OESTextureFloatLinear() {
  }

  // Cache the extension so it's specific to each context like extensions should be
  function getOESTextureFloatLinear(gl) {
    if (gl.$OES_texture_float_linear$ === void 0) {
      Object.defineProperty(gl, '$OES_texture_float_linear$', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: new OESTextureFloatLinear()
      });
    }
    return gl.$OES_texture_float_linear$;
  }

  // This replaces the real getExtension()
  function getExtension(name) {
    return name === 'OES_texture_float_linear'
      ? getOESTextureFloatLinear(this)
      : oldGetExtension.call(this, name);
  }

  // This replaces the real getSupportedExtensions()
  function getSupportedExtensions() {
    var extensions = oldGetSupportedExtensions.call(this);
    if (extensions.indexOf('OES_texture_float_linear') === -1) {
      extensions.push('OES_texture_float_linear');
    }
    return extensions;
  }

  // Get a WebGL context
  try {
    var gl = document.createElement('canvas').getContext('experimental-webgl');
  } catch (e) {
  }

  // Don't install the polyfill if the browser already supports it or doesn't have WebGL
  if (!gl || gl.getSupportedExtensions().indexOf('OES_texture_float_linear') !== -1) {
    return;
  }

  // Install the polyfill if linear filtering works with floating-point textures
  if (supportsOESTextureFloatLinear(gl)) {
    var oldGetExtension = WebGLRenderingContext.prototype.getExtension;
    var oldGetSupportedExtensions = WebGLRenderingContext.prototype.getSupportedExtensions;
    WebGLRenderingContext.prototype.getExtension = getExtension;
    WebGLRenderingContext.prototype.getSupportedExtensions = getSupportedExtensions;
  }
}());
