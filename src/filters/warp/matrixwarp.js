/**
 * @filter        Matrix Warp
 * @description   Transforms an image by a 2x2 or 3x3 matrix. The coordinates used in
 *                the transformation are (x, y) for a 2x2 matrix or (x, y, 1) for a
 *                3x3 matrix, where x and y are in units of pixels.
 * @param matrix  A 2x2 or 3x3 matrix represented as either a list or a list of lists.
 *                For example, the 3x3 matrix [[2,0,0],[0,3,0],[0,0,1]] can also be
 *                represented as [2,0,0,0,3,0,0,0,1] or just [2,0,0,3].
 * @param inverse A boolean value that, when true, applies the inverse transformation
 *                instead. (optional, defaults to false)
 */
function matrixWarp(matrix, inverse) {
    gl.matrixWarp = gl.matrixWarp || warpShader('\
        uniform mat3 matrix;\
    ', '\
        vec3 warp = matrix * vec3(coord, 1.0);\
        coord = warp.xy / warp.z;\
    ');

    // Flatten all members of matrix into one big list
    matrix = Array.prototype.concat.apply([], matrix);

    // Extract a 3x3 matrix out of the arguments
    if (matrix.length == 4) {
        matrix = [
            matrix[0], matrix[1], 0,
            matrix[2], matrix[3], 0,
            0, 0, 1
        ];
    } else if (matrix.length != 9) {
        throw 'can only warp with 2x2 or 3x3 matrix';
    }

    simpleShader.call(this, gl.matrixWarp, {
        matrix: inverse ? getInverse(matrix) : matrix,
        texSize: [this.width, this.height]
    });

    return this;
}
