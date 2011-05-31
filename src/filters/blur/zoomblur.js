function zoomBlur(centerX, centerY, strength) {
    gl.zoomBlur = gl.zoomBlur || new Shader(null, '\
        uniform sampler2D texture;\
        uniform vec2 center;\
        uniform float strength;\
        uniform vec2 texSize;\
        varying vec2 texCoord;\
        \
        /* random number between 0 and 1 */\
        float random(vec3 scale, float seed) {\
            /* use the fragment position for randomness */\
            return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\
        }\
        \
        void main() {\
            vec3 color = vec3(0.0);\
            float total = 0.0;\
            vec2 toCenter = center - texCoord * texSize;\
            \
            /* randomize the lookup values to hide the fixed number of samples */\
            float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\
            \
            for (float t = 0.0; t <= 40.0; t++) {\
                float percent = (t + offset) / 40.0;\
                float weight = 4.0 * (percent - percent * percent);\
                color += texture2D(texture, texCoord + toCenter * percent * strength / texSize).rgb * weight;\
                total += weight;\
            }\
            gl_FragColor = vec4(color / total, 1.0);\
        }\
    ');

    simpleShader.call(this, gl.zoomBlur, {
        center: [centerX, centerY],
        strength: strength,
        texSize: [this.width, this.height]
    });

    return this;
}
