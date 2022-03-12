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

void main()
{   
    gl_Position = proj * view * model * vec4(vPos, 1.0);
}