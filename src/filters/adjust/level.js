/**
 * @filter           ColorLevelAdjustment
 * @description      Provides minInput,maxInput,gamma,minOutput,maxOutput.
 * @param minInput 0 to 1 
 * @param gamma   0 to 1 
 * @param maxInput   0 to 1 
 * @param minOutput   0 to 1 
 * @param maxOutput   0 to 1 
 */
function level(minInput, maxInput, gamma, minOutput, maxOutput) {
    gl.colorLevel = gl.level || new Shader(null, `
    #define GammaCorrection(color, gamma)								pow(color, 1.0 / gamma)
    #define LevelsControlInputRange(color, minInput, maxInput)				min(max(color - minInput, vec3(0.0)) / (maxInput - minInput), vec3(1.0))
    #define LevelsControlInput(color, minInput, gamma, maxInput)				GammaCorrection(LevelsControlInputRange(color, minInput, maxInput), gamma)
    #define LevelsControlOutputRange(color, minOutput, maxOutput) 			mix(minOutput, maxOutput, color)
    #define LevelsControl(color, minInput, gamma, maxInput, minOutput, maxOutput) 	LevelsControlOutputRange(LevelsControlInput(color, minInput, gamma, maxInput), minOutput, maxOutput)
    varying vec2 texCoord;
    uniform sampler2D texture;
    uniform vec3 minInput;
    uniform vec3 gamma;
    uniform vec3 maxInput;
    uniform vec3 minOutput;
    uniform vec3 maxOutput;
    void main()
    {
      vec4 textureColor = texture2D(texture, texCoord);
      
      gl_FragColor = vec4(LevelsControl(textureColor.rgb, minInput, gamma, maxInput, minOutput, maxOutput), textureColor.a);
    }
    `);

    const clampMinInput = clamp(0, minInput, 1)
    const clampMaxInput = clamp(0, maxInput, 1)
    const clampGamma = clamp(0, gamma, 1)
    const clampMinOutput = clamp(0, minOutput, 1)
    const clampMaxOutput = clamp(0, maxOutput, 1)
    simpleShader.call(this, gl.colorLevel, {
        minInput: [clampMinInput, clampMinInput, clampMinInput],
        maxInput: [clampMaxInput, clampMaxInput, clampMaxInput],
        gamma: [clampGamma, clampGamma, clampGamma],
        minOutput: [clampMinOutput, clampMinOutput, clampMinOutput],
        maxOutput: [clampMaxOutput, clampMaxOutput, clampMaxOutput]
    })

    return this
}