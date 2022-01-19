/**
 * @filter           Color Adjust
 * @description      Provides min and max RGB chanel control.
 * @param rmin       0 to 255, minimum Red Chanel value
 * @param rmax       0 to 255, maximum Red Chanel value
 * @param gmin       0 to 255, minimum Green Chanel value
 * @param gmax       0 to 255, maximum Green Chanel value
 * @param bmin       0 to 255, minimum Blue Chanel value
 * @param bmax       0 to 255, maximum Blue Chanel value
 */
function coloradjust(rmin, rmax, gmin, gmax, bmin, bmax) {
    gl.coloradjust = gl.coloradjust || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float rmin;\
        uniform float rmax;\
        uniform float gmin;\
        uniform float gmax;\
        uniform float bmin;\
        uniform float bmax;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            color.r = color.r * ((rmax - rmin) / 1.0) + rmin;\
            color.g = color.g * ((gmax - gmin) / 1.0) + gmin;\
            color.b = color.b * ((bmax - bmin) / 1.0) + bmin;\
            gl_FragColor = color;\
        }\
    ');

    simpleShader.call(this, gl.coloradjust, {
        rmin: rmin / 255,
        rmax: rmax / 255,
        gmin: gmin / 255,
        gmax: gmax / 255,
        bmin: bmin / 255,
        bmax: bmax / 255
    });

    return this;
}