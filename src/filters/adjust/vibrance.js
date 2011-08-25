/**
 * @filter           Vibrance
 * @description      Change saturation in a smart way by boosting more saturated values
 *                   less than less saturated values.
 * @param vibrance   -1 to 1 (-1 is less vibrant, 0 is no change, and 1 is more vibrant)
 */
function vibrance(vibrance) {
    gl.vibrance = gl.vibrance || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float vibrance;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            \
            float average = (color.r + color.g + color.b) / 3.0;\
            float mx = max(color.r, max(color.g, color.b));\
            float amt = (mx - average) * (-vibrance);\
            \
            color.rgb += (mx - color.rgb) * amt;\
            \
            gl_FragColor = color;\
        }\
    ');

    simpleShader.call(this, gl.vibrance, {
        vibrance: clamp(-1, vibrance, 1)
    });

    return this;
}
