/**
 * @filter           Contrast
 * @description      Provides multiplicative contrast control.
 * @param contrast   0 to 4 ( 1 is no change,)
 */
function softContrast(contrast) {
    gl.softContrast = gl.softContrast || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float contrast;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            color.r = (color.r - 0.5) * contrast + 0.5;\
            color.g = (color.g - 0.5) * contrast + 0.5;\
            color.b = (color.b - 0.5) * contrast + 0.5;\
            gl_FragColor = color;\
        }\
    ');

    simpleShader.call(this, gl.softContrast, {
        contrast: contrast
    });

    return this;
}
