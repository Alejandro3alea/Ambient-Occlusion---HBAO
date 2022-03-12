#version 400 core

layout (location = 0) in vec3 vPos;

// ------------------- UNIFORM -------------------

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;

struct Light
{
    vec3 pos;
    vec3 color;
    float radius;
};

uniform Light uLight;

// --------------------- OUT ---------------------

void main()
{
    gl_Position = proj * view * vec4(vPos * uLight.radius * 2.0 + uLight.pos, 1.0);
}