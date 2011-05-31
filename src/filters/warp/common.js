function warpShader(uniforms, warp) {
    return new Shader(null, uniforms + '\
    uniform sampler2D texture;\
    uniform vec2 texSize;\
    varying vec2 texCoord;\
    void main() {\
        vec2 coord = texCoord * texSize;\
        ' + warp + '\
        gl_FragColor = texture2D(texture, coord / texSize);\
        vec2 clampedCoord = clamp(coord, vec2(0.0), texSize);\
        if (coord != clampedCoord) {\
            /* fade to transparent if we are outside the image (using premultiplied alpha!) */\
            gl_FragColor *= max(0.0, 1.0 - length(coord - clampedCoord));\
        }\
    }');
}
