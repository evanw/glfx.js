/**
 * @filter           Mirror
 * @description      mirror rhe image horizontaly
 */
function mirror() {
    gl.mirror = gl.mirror || new Shader(null, '\
        uniform sampler2D texture;\
        uniform float brightness;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, vec2(1.0 - texCoord.x,texCoord.y));\
            gl_FragColor = color;\
        }\
    ');

    simpleShader.call(this, gl.mirror, {  
    });

    return this;
}