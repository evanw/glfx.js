function bulgePinch(centerX, centerY, radius, strength) {
    gl.bulgePinch = gl.bulgePinch || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float radius;\
        uniform float strength;\
        uniform vec2 center;\
        uniform vec2 texSize;\
        varying vec2 texCoord;\
        void main() {\
            vec2 coord = texCoord * texSize;\
            coord -= center + 1.0;\
            float distance = length(coord);\
            if (distance < radius) {\
                float percent = distance / radius;\
                if (strength > 0.0) {\
                    coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);\
                } else {\
                    coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);\
                }\
            }\
            coord += center + 1.0;\
            gl_FragColor = texture2D(texture, coord / texSize);\
        }\
    ');

    simpleShader.call(this, gl.bulgePinch, {
        radius: radius,
        strength: strength,
        center: [centerX, centerY],
        texSize: [this.width, this.height]
    });

    return this;
}
