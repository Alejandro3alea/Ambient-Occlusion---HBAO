#version 400 core

#define HORIZONTAL_BLUR 0
#define VERTICAL_BLUR 1

// --------------------- IN ---------------------
in vec2 texUV;

// --------------------- OUT --------------------
layout(location = 0) out vec4 BlurOutput;

// ------------------- UNIFORM ------------------

uniform sampler2D uTextureData;

uniform float uBFSpace;
uniform float uBFRange;

float GetSigmaFunction(float val, float sigma)
{
    float div = val / sigma;
	return 0.5 * exp(-0.5 * div * div) / sigma;
}

void main()
{
    vec2 tex_size = 1.0 / textureSize(uTextureData, 0); // gets size of single texel
    vec3 currTexel = texture(uTextureData, texUV).rgb;
    const int sizeBlur = 6;
    
    float count = 0.0;
    vec3 result = currTexel;
    for(int i = -sizeBlur; i <= sizeBlur; ++i)
    {
        for(int j = -sizeBlur; j <= sizeBlur; ++j)
        {
            vec2 dir = vec2(tex_size.x * i, tex_size.y * j);
            float len = length(dir);
            vec3 col = texture(uTextureData, texUV + dir).rgb;
            float tileResult = GetSigmaFunction(len, uBFSpace) * GetSigmaFunction(length(col - currTexel), uBFRange);
            result += tileResult * col;
            count += tileResult;
        }
    }

    BlurOutput = vec4(result / count, 1.0);
}
