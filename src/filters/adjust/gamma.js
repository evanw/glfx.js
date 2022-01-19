/**
 * @filter           Gamma
 * @description      Allow control of image Gamma
 * @param gamma      0 to 1 Importance of the image gamma
 */
function gamma(gamma) {
    gl.gamma = gl.gamma || new Shader(null, '\
        varying vec2 texCoord;\
        uniform sampler2D texture;\
        uniform highp float gamma;\
        void main()\
        {\
            vec4 color = texture2D(texture, texCoord);\
            color.r = pow(color.r, gamma);\
            color.g = pow(color.g, gamma);\
            color.b = pow(color.b, gamma);\
            gl_FragColor = color;\
        }\
    ');

    simpleShader.call(this, gl.gamma, {
        gamma: gamma
    });

    return this;
}
