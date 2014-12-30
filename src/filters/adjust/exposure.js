/**
 * @filter           Exposure
 * @description      Allow control of image exposure
 * @param exposure   0 to 1 Importance of the image exposure
 */

function exposure(exposure) {
    gl.exposure = gl.exposure || new Shader(null, '\
        varying vec2 texCoord;\
        uniform sampler2D texture;\
        uniform highp float exposure;\
        void main()\
        {\
            vec4 textureColor = texture2D(texture, texCoord);\
            gl_FragColor = vec4(textureColor.rgb * pow(2.0, exposure), textureColor.a);\
        }\
    ');

    simpleShader.call(this, gl.exposure, {
        exposure: exposure
    });

    return this;
}
