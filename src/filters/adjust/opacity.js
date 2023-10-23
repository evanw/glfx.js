/**
 * @filter           Brightness / Contrast
 * @description      Provides additive brightness and multiplicative contrast control.
 * @param alpha 0 to 1 (0 means transparent,1 means full fill)
 */
function opacity(alpha) {
    gl.opacity = gl.opacity || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float alpha;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            gl_FragColor = vec4(color.rgb,alpha);\
        }\
    ');

    simpleShader.call(this, gl.opacity, {
        alpha: clamp(0, alpha, 1),
    });

    return this;
}
