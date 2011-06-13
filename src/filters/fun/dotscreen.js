/**
 * @filter        Dot Screen
 * @description   Simulates a black and white halftone rendering of the image by multiplying
 *                pixel values with a rotated 2D sine wave pattern.
 * @param centerX The x coordinate of the pattern origin.
 * @param centerY The y coordinate of the pattern origin.
 * @param angle   The rotation of the pattern in radians.
 * @param size    The diameter of a dot in pixels.
 */
function dotScreen(centerX, centerY, angle, size) {
    gl.dotScreen = gl.dotScreen || new Shader(null, '\
        uniform sampler2D texture;\
        uniform vec2 center;\
        uniform float angle;\
        uniform float scale;\
        uniform vec2 texSize;\
        varying vec2 texCoord;\
        \
        float pattern() {\
            float s = sin(angle), c = cos(angle);\
            vec2 tex = texCoord * texSize - center;\
            vec2 point = vec2(\
                c * tex.x - s * tex.y,\
                s * tex.x + c * tex.y\
            ) * scale;\
            return (sin(point.x) * sin(point.y)) * 4.0;\
        }\
        \
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            float average = (color.r + color.g + color.b) / 3.0;\
            gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\
        }\
    ');

    simpleShader.call(this, gl.dotScreen, {
        center: [centerX, centerY],
        angle: angle,
        scale: Math.PI / size,
        texSize: [this.width, this.height]
    });

    return this;
}
