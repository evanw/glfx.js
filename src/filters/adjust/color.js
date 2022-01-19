/**
 * @filter           Color
 * @description      Give more or less importance to a color
 * @param alpha      0 to 1 Importance of the color modification
 * @param r          0 to 1 Importance of the Red Chanel modification
 * @param g          0 to 1 Importance of the Green Chanel modification
 * @param b          0 to 1 Importance of the Blue Chanel modification
 */
function color(alpha,r,g,b) {
    gl.color = gl.color || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float r;\
        uniform float g;\
        uniform float b;\
        uniform float a;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            color.r += r * a;\
            color.g += g * a;\
            color.b += b * a;\
            gl_FragColor = color;\
        }\
    ');

    simpleShader.call(this, gl.color, {
       r  : r,
       g  : g,
       b  : b,
       a  : alpha
    });

    return this;
}