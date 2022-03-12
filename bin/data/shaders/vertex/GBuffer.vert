#version 400 core

layout (location = 0) in vec3 vPos;
layout (location = 1) in vec3 vNormal;
layout (location = 2) in vec2 vTexCoord;
layout (location = 3) in vec4 vTangent;

// ------------------- UNIFORM -------------------

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;

uniform vec3 uViewPos;

// --------------------- OUT ---------------------
out OUT_IN_VARIABLES {
	vec2 texUV;
	vec3 fragPos;
	vec3 normal;
    vec3 T;
    vec3 B;
    vec3 N;
} outVar;

void main()
{
    outVar.fragPos = vec3(model * vec4(vPos, 1.0));   
    mat3 normalMatrix = transpose(inverse(mat3(model)));
    outVar.normal = normalize(normalMatrix * vNormal);   
    outVar.texUV = vTexCoord;
    
    outVar.N = normalize(mat3(model) * vNormal);
    outVar.T = normalize(mat3(model) * vTangent.rgb);
    outVar.B = normalize(mat3(model) * cross(outVar.N, outVar.T) * vTangent.w);
        
    gl_Position = proj * view * model * vec4(vPos, 1.0);
}