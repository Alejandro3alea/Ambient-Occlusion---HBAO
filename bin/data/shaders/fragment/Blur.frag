#version 400 core

#define HORIZONTAL_BLUR 0
#define VERTICAL_BLUR 1

// --------------------- IN ---------------------
in vec2 texUV;

// --------------------- OUT --------------------
layout(location = 0) out vec4 BlurOutput;

// ------------------- UNIFORM ------------------

uniform sampler2D uTextureData;

uniform int uBlurMode;
uniform float weight[6] = float[] (0.2270270270, 0.1945945946, 0.1575945946, 0.1216216216, 0.0540540541, 0.0162162162);

vec3 HorizontalBlur(const sampler2D texBuffer, const vec2 tex_size, const vec3 vec)
{
   vec3 result = vec;
   for(int i = 1; i < 6; ++i)
   {
      result += texture(texBuffer, texUV + vec2(tex_size.x * i, 0.0)).rgb * weight[i];
      result += texture(texBuffer, texUV - vec2(tex_size.x * i, 0.0)).rgb * weight[i];
   }

   return result;
}

vec3 VerticalBlur(const sampler2D texBuffer, const vec2 tex_size, const vec3 vec)
{
   vec3 result = vec;
   for(int i = 1; i < 6; ++i)
   {
      result += texture(texBuffer, texUV + vec2(0.0, tex_size.y * i)).rgb * weight[i];
      result += texture(texBuffer, texUV - vec2(0.0, tex_size.y * i)).rgb * weight[i];
   }

   return result;
}

void main()
{
    vec2 tex_size = 1.0 / textureSize(uTextureData, 0); // gets size of single texel
    vec3 blurResult = texture(uTextureData, texUV).rgb * weight[0];

	switch (uBlurMode)
    {
    case HORIZONTAL_BLUR:
       blurResult = HorizontalBlur(uTextureData, tex_size, blurResult);
       break;
    case VERTICAL_BLUR:
       blurResult = VerticalBlur(uTextureData, tex_size, blurResult);
       break;
    }
    
    BlurOutput = vec4(blurResult, 1.0f);
}
