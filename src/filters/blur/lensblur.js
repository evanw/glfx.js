/**
 * @filter           Lens Blur
 * @description      Imitates a camera capturing the image out of focus by using a blur that generates
 *                   the "circular disks" known as bokeh. This filter is considerably more expensive
 *                   than other blurs because it is non-separable, so the radius is limited to a maximum
 *                   of 20 pixels to avoid locking up the GPU. The implementation is faster than a naive
 *                   implementation because it uses bilinear filtering to perform four texture lookups
 *                   simultaneously. Each blur of a different radius needs to compile a separate shader
 *                   on first use, which takes a noticable amount of time to compile for larger radii.
 *                   This filter makes use of the floating point texture WebGL extension to implement
 *                   the brightness parameter, so there will be severe visual artifacts if brightness
 *                   is non-zero and the floating point texture extension is not available.
 * @param radius     1 to 20 (the radius of the circular disk convolved with the image)
 * @param brightness -1 to 1 (the brightness of the bokeh, negative values will create dark bokeh)
 */
function lensBlur(radius, brightness) {
    radius = Math.max(0, Math.min(20, Math.floor(radius)));
    if (radius == 0 || isNaN(radius)) return this;

    // All averaging is done on values raised to the 6th power to make more obvious
    // bokeh (we will raise the average to the 1/6th power at the end to compensate).
    // Without this the image looks almost like a normal blurred image. This hack is
    // obviously not realistic, but to accurately simulate this we would need a high
    // dynamic range source photograph which we don't have.
    gl.lensBlurPrePass = gl.lensBlurPrePass || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float power;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            color = pow(color, vec4(power));\
            gl_FragColor = vec4(color);\
        }\
    ');

    name = 'lensBlur' + radius;
    gl[name] = gl[name] || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float power;\
        uniform float radius;\
        uniform vec2 texSize;\
        varying vec2 texCoord;\
        \
        vec4 sample(float x, float y) {\
            return texture2D(texture, texCoord + vec2(x, y) / texSize);\
        }\
        \
        void main() {\
            vec4 color = vec4(0.0);\
            ' + (function() {
                // Do the expensive O(n^4) convolution, except use the built-in bilinear
                // filtering capability comes for free to do four averages in one lookup
                // for a speedup of 4x. We still need to generate extra lookups around the
                // edges, however, to make the bokeh a perfect circle.
                function inCircle(x, y) {
                    return x * x + y * y <= (radius + 0.25) * (radius + 0.25);
                }
                function sample(weight, x, y) {
                    text += 'color+=sample(' + x.toFixed(1) + ',' + y.toFixed(1) + ')' + (weight == 1 ? '' : '*' + weight.toFixed(1)) + ';';
                    total += weight;
                }
                var text = '', total = 0;
                for (var x = -radius; x <= radius; x += 2) {
                    for (var y = -radius; y <= radius; y += 2) {
                        var in00 = inCircle(x, y);
                        var in01 = inCircle(x, y + 1);
                        var in10 = inCircle(x + 1, y);
                        var in11 = inCircle(x + 1, y + 1);
                        if (in00 && in01 && in10 && in11) sample(4, x + 0.5, y + 0.5);
                        else if (in00 && in01 && !in10 && !in11) sample(2, x, y + 0.5);
                        else if (in00 && in10 && !in01 && !in11) sample(2, x + 0.5, y);
                        else if (in10 && in11 && !in00 && !in01) sample(2, x + 1, y + 0.5);
                        else if (in01 && in11 && !in00 && !in10) sample(2, x + 0.5, y + 1);
                        else {
                            if (in00) sample(1, x, y);
                            if (in01) sample(1, x, y + 1);
                            if (in10) sample(1, x + 1, y);
                            if (in11) sample(1, x + 1, y + 1);
                        }
                    }
                }
                text += 'color/=' + total.toFixed(1) + ';';
                return text;
            })() + '\
            color = pow(color, vec4(power));\
            gl_FragColor = color;\
        }\
    ');

    var power = Math.pow(10, clamp(-1, brightness, 1));
    simpleShader.call(this, gl.lensBlurPrePass, {
        power: power
    });
    simpleShader.call(this, gl[name], {
        power: 1 / power,
        texSize: [this.width, this.height]
    });

    return this;
}
