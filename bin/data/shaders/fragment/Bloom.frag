#version 400 core

// --------------------- IN ---------------------
in vec2 texUV;

// --------------------- OUT --------------------
layout(location = 0) out vec4 BloomColor;

// ------------------- UNIFORM ------------------
uniform sampler2D uDefaultBuffer;
uniform sampler2D uBlurBuffer;

void main()
{
    vec3 defaultTexel = texture(uDefaultBuffer, texUV).rgb;
    vec3 blurTexel = texture(uBlurBuffer, texUV).rgb;

    BloomColor = vec4(defaultTexel + blurTexel, 1.0);
}
