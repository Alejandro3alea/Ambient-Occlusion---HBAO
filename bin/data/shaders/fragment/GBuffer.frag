#version 400 core

// --------------------- IN ---------------------
in OUT_IN_VARIABLES {
	vec2 texUV;
	vec3 fragPos;
	vec3 normal;
    vec3 T;
    vec3 B;
    vec3 N;
} inVar;

// --------------------- OUT --------------------
layout(location = 0) out vec4 DiffuseColor;
layout(location = 1) out vec4 NormalColor;
layout(location = 2) out vec4 SpecularColor;
layout(location = 3) out vec4 PositionColor;


struct Material
{
	vec4 color;
	sampler2D diffuse;
	sampler2D normal;
	sampler2D specular;
	sampler2D oclussion;
	sampler2D emissive;
	
	bool isUsingSampler;
	bool isUsingNormalSampler;
	bool isUsingSpecularSampler;
};


// ------------------- UNIFORM ------------------
uniform Material uMaterial;

uniform vec3 uViewPos;

void main()
{
	vec3 diffuseTexel = uMaterial.isUsingSampler ? texture(uMaterial.diffuse, inVar.texUV).rgb : uMaterial.color.rgb;
	vec3 specularTexel = uMaterial.isUsingSpecularSampler ? texture(uMaterial.specular, inVar.texUV).rgb : vec3(1,1,1);
	vec3 normalTexel = texture(uMaterial.normal, inVar.texUV).rgb;
	normalTexel = mat3(inVar.T,inVar.B,inVar.N) * normalize(normalTexel * 2.0f - 1.0f);
	vec3 currNormal = uMaterial.isUsingNormalSampler ? normalTexel : inVar.normal;

	if (specularTexel.g <= 0.0) specularTexel.g = 0.01;

	if (texture(uMaterial.diffuse, inVar.texUV).a < 0.05)
		discard;

	DiffuseColor = vec4(diffuseTexel, 1.0);
	NormalColor = vec4(currNormal, 1.0);
	SpecularColor = vec4(specularTexel, 1.0);
	PositionColor = vec4(inVar.fragPos, 1.0);
}