#version 400 core

// --------------------- IN ---------------------
in vec2 texUV;

// --------------------- OUT --------------------
layout(location = 0) out vec4 DiffuseColor;
layout(location = 1) out vec4 NormalColor;
layout(location = 2) out vec4 SpecularColor;
layout(location = 3) out vec4 PositionColor;

// ------------------- UNIFORM ------------------
uniform sampler2D uTextureData[5];

void main()
{
    DiffuseColor  = vec4(texture(uTextureData[0], texUV).rgb, 1.0);
    NormalColor   = vec4(texture(uTextureData[1], texUV).rgb, 1.0);
    SpecularColor = vec4(texture(uTextureData[2], texUV).rgb, 1.0);
    PositionColor = vec4(texture(uTextureData[3], texUV).rgb, 1.0);

    gl_FragDepth = texture(uTextureData[4], texUV).r;
}
