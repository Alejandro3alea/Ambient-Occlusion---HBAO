#version 400 core

#define RENDER_DECAL 0
#define RENDER_VOLUME 1
#define RENDER_PROJ 2

// ------------------ STRUCTS ------------------
struct Decal
{
	sampler2D diffuse;
	sampler2D normal;
	sampler2D metallic;
	
	bool isUsingDiffuseSampler;
	bool isUsingNormalSampler;
	bool isUsingMetallicSampler;
};

// --------------------- IN ---------------------

// --------------------- OUT --------------------
layout(location = 0) out vec4 DiffuseColor;
layout(location = 1) out vec4 NormalColor;
layout(location = 2) out vec4 SpecularColor;
layout(location = 3) out vec4 PositionColor;

// ------------------- UNIFORM ------------------
uniform sampler2D uTextureData[5];
uniform Decal uDecal;
uniform vec2 uWinSize;

uniform vec3 uViewPos;
uniform vec3 uDecalPos;

uniform int uRenderMode;
uniform float uLimitingAngle;

uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;


void main()
{
    vec2 screenUV = gl_FragCoord.xy / uWinSize;

	// Get depth value
	float depth = texture(uTextureData[4], screenUV).r;
	
	// map from (0, 1) to (-1, 1)
    vec4 clipSpacePosition = vec4(screenUV * 2.0 - 1.0,  depth * 2.0 - 1.0,  1.0);
    vec4 viewSpacePosition = inverse(proj) * clipSpacePosition;

	vec4 worldPos = inverse(view) * viewSpacePosition;
    worldPos /= worldPos.w;

	vec4 objPos = inverse(model) * worldPos;
	objPos /= objPos.w;
	
	if (uRenderMode != RENDER_VOLUME)
		if (objPos.x < -0.5 || objPos.x > 0.5 || 
			objPos.y < -0.5 || objPos.y > 0.5 || 
			objPos.z < -0.5 || objPos.z > 0.5) 
				discard;

	// Map from (-0.5, 0.5) to (0, 1)
	vec2 fragUV = objPos.xy + 0.5;

	vec3 diffuseTexel = texture(uDecal.diffuse, fragUV).rgb;
	vec3 specularTexel = uDecal.isUsingMetallicSampler ? texture(uDecal.metallic, fragUV).rgb : vec3(1,1,1);
	
	if (specularTexel.g <= 0.0) specularTexel.g = 0.01;

	if (uRenderMode == RENDER_DECAL && texture(uDecal.diffuse, fragUV).a < 0.05)
		discard;
	
	vec3 normVal = normalize(texture(uTextureData[1], screenUV).rgb);
	vec3 viewDir = normalize(uDecalPos - worldPos.xyz);
	
	if (uRenderMode == RENDER_DECAL && acos(dot(normVal, viewDir)) < radians(uLimitingAngle))
		discard;

	vec3 T = normalize(dFdy(worldPos.rgb));
	vec3 B = normalize(dFdx(worldPos.rgb));
	vec3 N = cross(T, B);
	
	vec3 normalTexel = texture(uDecal.normal, fragUV).rgb;
	normalTexel = mat3(T,B,N) * -normalize(normalTexel * 2.0f - 1.0f);
	vec3 currNormal = uDecal.isUsingNormalSampler ? normalTexel : N;

	gl_FragDepth = depth - 0.01;

	switch(uRenderMode)
	{
	case RENDER_DECAL:
		DiffuseColor  = vec4(diffuseTexel, texture(uDecal.diffuse, fragUV).a);
		NormalColor   = vec4(currNormal, 1.0);
		SpecularColor = vec4(specularTexel, 1.0);
		break;
	default:
		DiffuseColor  = vec4(1.0, 1.0, 1.0, 1.0);
		NormalColor   = vec4(normVal, 1.0);
		SpecularColor = vec4(texture(uTextureData[2], screenUV).rgb, 1.0);
		break;
	}

}