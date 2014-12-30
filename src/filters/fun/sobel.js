/**
 * @description Sobel implementation of image with alpha and line color control
 * @param secondary (0 to 1), indice of sobel strength
 * @param coef (0 to 1), indice of sobel strength coeficient
 * @param alpha (0 to 1) how strong is the sobel result draw in top of image. (0 image is unchanged, 1 image is replace by sobel representation)
 * @param r (0 to 1) R chanel color of the sobel line
 * @param g (0 to 1) G chanel color of the sobel line
 * @param b (0 to 1) B chanel color of the sobel line
 * @param a (0 to 1) alpha chanel color of the sobel line
 * @param r2 (0 to 1) R chanel color of the sobel area
 * @param g2 (0 to 1) G chanel color of the sobel area
 * @param b2 (0 to 1) B chanel color of the sobel area
 * @param a2 (0 to 1) alpha chanel color of the sobel area
 */

function sobel(secondary, coef, alpha, r,g,b,a, r2,g2,b2, a2) {
    gl.sobel = gl.sobel || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float alpha;\
        uniform float r;\
        uniform float g;\
        uniform float b;\
        uniform float r2;\
        uniform float g2;\
        uniform float b2;\
        uniform float a2;\
        uniform float a;\
        uniform float secondary;\
        uniform float coef;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            float bottomLeftIntensity = texture2D(texture, texCoord + vec2(-0.0015625, 0.0020833)).r;\
            float topRightIntensity = texture2D(texture, texCoord + vec2(0.0015625, -0.0020833)).r;\
            float topLeftIntensity = texture2D(texture, texCoord + vec2(-0.0015625, 0.0020833)).r;\
            float bottomRightIntensity = texture2D(texture, texCoord + vec2(0.0015625, 0.0020833)).r;\
            float leftIntensity = texture2D(texture, texCoord + vec2(-0.0015625, 0)).r;\
            float rightIntensity = texture2D(texture, texCoord + vec2(0.0015625, 0)).r;\
            float bottomIntensity = texture2D(texture, texCoord + vec2(0, 0.0020833)).r;\
            float topIntensity = texture2D(texture, texCoord + vec2(0, -0.0020833)).r;\
            float h = -secondary * topLeftIntensity - coef * topIntensity - secondary * topRightIntensity + secondary * bottomLeftIntensity + coef * bottomIntensity + secondary * bottomRightIntensity;\
            float v = -secondary * bottomLeftIntensity - coef * leftIntensity - secondary * topLeftIntensity + secondary * bottomRightIntensity + coef * rightIntensity + secondary * topRightIntensity;\
\
            float mag = length(vec2(h, v));\
            if (mag < 0.5) {\
                float al = alpha * a;\
                color.rgb *= (1.0 - al);\
                color.r += r * al;\
                color.g += g * al;\
                color.b += b * al;\
                color.rgb += al * mag;\
            } else { \
                float al = alpha * a2;\
                color.rgb *= (1.0 - al);\
                color.r += r2 * al;\
                color.g += g2 * al;\
                color.b += b2 * al;\
                color.rgb += al * mag;\
            }\
            gl_FragColor = color;\
        }\
    ');
    console.log(arguments);
    simpleShader.call(this, gl.sobel, {
        secondary : secondary,
        coef : coef,
        alpha : alpha,
        r : r,
        g : g,
        b : b,
        a : a,
        r2 : r2,
        g2 : g2,
        b2 : b2,
        a2: a2
    });

    return this;
}