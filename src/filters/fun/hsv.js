/**
 * @description  transform image to HSV
 */

function toHSV() {
    gl.toHSV = gl.toHSV || new Shader(null, '\
        uniform sampler2D texture;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            if (texCoord.y > 0.5){\
            float min = color.r;\
            float max = color.r;\
\
            if (color.g < min){\
                min = color.g;\
            }   \
            if (color.g > max){\
                max = color.g;\
            }\
            if (color.b < min){\
                min = color.b;\
            }\
            if (color.b > max){\
                max = color.b;\
            }\
\
            float delta = max - min;\
            float s = 0.0;\
            float h = 0.0;\
            float v = max;\
            if (max != 0.0) {\
                s = delta / max;\
                if (color. r == max) {\
                    h = (color.g - color.b) / delta;\
                }\
                else if (color.g == max){\
                    h = 2.0 + (color.b - color.r) / delta;\
                }\
                else {\
                    h = 4.0 + (color.r - color.g) / delta;\
                }\
                h = h * 60.0;\
                if (h < 0.0)\
                    h = h + 360.0;\
            }\
            color.r = h / 360.0;\
            color.g = s;\
            color.b = v;\
        }\
            gl_FragColor = color;\
        }\
    ');

    simpleShader.call(this, gl.toHSV, {

    });

    return this;
}