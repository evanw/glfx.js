/**
 * @filter       GammaRGB
 * @description  Full controll of image Gamma similar to SVG feComponentTransferElement Gamma implementation
 *               see http://www.w3.org/TR/2010/WD-SVG11-20100622/filters.html#feComponentTransferElement for doc
 */

//FE Component transfert
function gammaRGB(amplitudeR, exponentR, offsetR ,amplitudeG,exponentG, offsetG, amplitudeB,exponentB, offsetB) {
    gl.gammaRGB = gl.gammaRGB || new Shader(null, '\
        varying vec2 texCoord;\
        uniform sampler2D texture;\
        uniform highp float amplitudeR;\
        uniform highp float amplitudeG;\
        uniform highp float amplitudeB;\
        uniform highp float exponentR;\
        uniform highp float exponentG;\
        uniform highp float exponentB;\
        uniform highp float offsetR;\
        uniform highp float offsetG;\
        uniform highp float offsetB;\
        void main()\
        {\
            vec4 color = texture2D(texture, texCoord);\
            color.r = amplitudeR * pow(color.r, exponentR) + offsetR;\
            color.g = amplitudeG * pow(color.g, exponentG) + offsetG;\
            color.b = amplitudeB * pow(color.b, exponentB) + offsetB;\
            gl_FragColor = color;\
        }\
    ');

    simpleShader.call(this, gl.gammaRGB, {
      amplitudeR : amplitudeR,
      amplitudeG : amplitudeG,
      amplitudeB : amplitudeB,
      exponentR : exponentR,
      exponentG : exponentG,
      exponentB : exponentB,
      offsetR : offsetR,
      offsetG : offsetG,
      offsetB : offsetB
    });

    return this;
}