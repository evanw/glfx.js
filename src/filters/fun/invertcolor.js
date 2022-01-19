/**
 * @description Invert the colors!
 */

function invertColor() {
    gl.invertColor = gl.invertColor || new Shader(null, '\
        uniform sampler2D texture;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            color.rgb = 1.0 - color.rgb;\
            gl_FragColor = color;\
        }\
    ');
    simpleShader.call(this, gl.invertColor, {});
    return this;
}