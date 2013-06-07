/**
 * @filter         Skin
 * @description    Filters-out pixels not matching skin color.
 * from: 
 * Human skin color clustering for face detection
 * J. Kovac, P. Peer, F. Solina - 2003
 */
function skin() {
    gl.skin = gl.skin || new Shader(null, '\
        uniform sampler2D texture;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            float r = color.r;\
            float g = color.g;\
            float b = color.b;\
            \
            if ((r>45.0/255.0)&&(g>40.0/255.0)&&(b>20.0/255.0)\
                &&(r>g)&&(r>b)\
                &&(r-min(g,b)>15.0/255.0)\
                &&(abs(r-g)>15.0/255.0)){\
                gl_FragColor = color;\
            } else {\
                gl_FragColor = vec4(0.0,0.0,0.0,color.a);\
            }\
        }\
    ');

    simpleShader.call(this, gl.skin, {
        amount: clamp(0, 1)
    });

    return this;
}
