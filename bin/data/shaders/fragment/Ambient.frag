#version 400 core

// --------------------- IN ---------------------
in vec2 texUV;

// --------------------- OUT --------------------
layout(location = 0) out vec4 FragColor;

// ------------------- UNIFORM ------------------
uniform sampler2D uHBAOData;
uniform sampler2D uTextureData[5];
uniform bool uUseHBAO;

void main()
{
    vec3 HBAOTexel = uUseHBAO ? texture(uHBAOData, texUV).rgb : vec3(1.0f);
    vec3 defaultTexel = texture(uTextureData[0], texUV).rgb;

    FragColor = vec4(0.25 * defaultTexel * HBAOTexel, 1.0);
}
