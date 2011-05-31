function swirl(centerX, centerY, radius, angle) {
    gl.swirl = gl.swirl || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float radius;\
        uniform float angle;\
        uniform vec2 center;\
        uniform vec2 texSize;\
        varying vec2 texCoord;\
        void main() {\
            vec2 coord = texCoord * texSize;\
            coord -= center;\
            float distance = length(coord);\
            if (distance < radius) {\
                float percent = (radius - distance) / radius;\
                float theta = percent * percent * angle;\
                float s = sin(theta);\
                float c = cos(theta);\
                coord = vec2(\
                    coord.x * c - coord.y * s,\
                    coord.x * s + coord.y * c\
                );\
            }\
            coord += center;\
            gl_FragColor = texture2D(texture, coord / texSize);\
        }\
    ');

    simpleShader.call(this, gl.swirl, {
        radius: radius,
        center: [centerX, centerY],
        angle: angle,
        texSize: [this.width, this.height]
    });

    return this;
}
