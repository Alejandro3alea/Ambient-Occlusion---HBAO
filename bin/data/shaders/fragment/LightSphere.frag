#version 400 core

// --------------------- IN ---------------------
in vec2 texUV;

// --------------------- OUT --------------------
layout(location = 0) out vec4 FragColor;

// ------------------- UNIFORM ------------------
uniform sampler2D uTextureData[4];

struct Light
{
    vec3 pos;
    vec3 color;
    float radius;
};

uniform Light uLight;
uniform vec3 uViewPos;
uniform vec2 uWinSize;

void main()
{
    vec2 uv = gl_FragCoord.xy / uWinSize;
	vec3 diffuseTexel  = texture(uTextureData[0], uv).rgb;
	vec3 normalTexel   = texture(uTextureData[1], uv).rgb;
	vec3 specularTexel   = texture(uTextureData[2], uv).rgb;
	vec3 positionTexel = texture(uTextureData[3], uv).rgb;

    float ns = specularTexel.g;
    float specular = specularTexel.b;

    vec3 viewDir  = normalize(uViewPos - positionTexel);
    vec3 lightDir = normalize(uLight.pos - positionTexel);
    vec3 dif = max(dot(normalTexel.rgb, lightDir), 0.0) * diffuseTexel.rgb * uLight.color;
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    vec3 spec = pow(max(dot(normalTexel.rgb, halfwayDir), 0.0), ns) * vec3(specular);

    float att = 1.0 - min(length(uLight.pos - positionTexel)/uLight.radius, 1.0);
    dif *= att;
    spec *= att;   
	FragColor += vec4(dif + spec, 1.0f);
}
