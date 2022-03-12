#version 400 core

// --------------------- IN ---------------------
in vec2 texUV;

// --------------------- OUT --------------------
layout(location = 0) out vec4 LuminanceColor;

// ------------------- UNIFORM ------------------
uniform sampler2D uTextureData;

void main()
{
    vec3 currTexel = texture(uTextureData, texUV).rgb;
    float brightness = dot(currTexel, vec3(0.2126, 0.7152, 0.0722));
	LuminanceColor = (brightness > 1.0) ? vec4(currTexel, 1.0f) : vec4(0.0, 0.0, 0.0, 1.0);
}
