function matrixWarp(matrix) {
    gl.matrixWarp = gl.matrixWarp || new Shader(null, '\
        uniform sampler2D texture;\
        uniform mat3 matrix;\
        uniform vec2 texSize;\
        varying vec2 texCoord;\
        void main() {\
            vec2 coord = texCoord * texSize;\
            vec3 warp = matrix * vec3(coord, 1.0);\
            coord = warp.xy / warp.z;\
            gl_FragColor = texture2D(texture, coord / texSize);\
        }\
    ');

    // Flatten all arguments into one big list
    matrix = Array.prototype.concat.apply([], arguments);

    // Extract a 4x4 matrix out of the arguments
    if (matrix.length == 4) {
        matrix = [
            matrix[0], matrix[2], 0,
            matrix[1], matrix[3], 0,
            0, 0, 1
        ];
    } else if (matrix.length == 9) {
        matrix = [
            matrix[0], matrix[3], matrix[6],
            matrix[1], matrix[4], matrix[7],
            matrix[2], matrix[5], matrix[8]
        ];
    } else {
        throw 'can only warp with 2x2 or 3x3 matrix';
    }

    simpleShader.call(this, gl.matrixWarp, {
        matrix: matrix,
        texSize: [this.width, this.height]
    });

    return this;
}
