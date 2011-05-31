function brightnessContrast(brightness, contrast) {
    gl.brightnessContrast = gl.brightnessContrast || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float brightness;\
        uniform float contrast;\
        varying vec2 texCoord;\
        void main() {\
            vec3 color = texture2D(texture, texCoord).rgb;\
            color += brightness;\
            if (contrast > 0.0) {\
                color = (color - 0.5) / (1.0 - contrast) + 0.5;\
            } else {\
                color = (color - 0.5) * (1.0 + contrast) + 0.5;\
            }\
            gl_FragColor = vec4(color, 1.0);\
        }\
    ');

    simpleShader.call(this, gl.brightnessContrast, {
        brightness: clamp(-1, brightness, 1),
        contrast: clamp(-1, contrast, 1)
    });

    return this;
}
