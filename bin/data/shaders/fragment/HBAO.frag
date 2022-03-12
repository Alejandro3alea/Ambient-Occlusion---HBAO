#version 400 core

// --------------------- IN ---------------------
in vec2 texUV;

// --------------------- OUT --------------------
layout(location = 0) out vec4 FragColor;

// ------------------- UNIFORM ------------------
uniform sampler2D uTextureData[5];

uniform float uRadiusScale;
uniform float uAngleBias;
uniform int uDirCount;
uniform int uStepCount;
uniform float uAttenuation;
uniform float uScaleAO;

uniform mat4 proj;
uniform mat4 view;

// The canonical "one-liner I found somewhere on the internet" that generates a random float (see https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl)
float rand(vec2 val)
{
    return fract(sin(dot(val ,vec2(12.9898f, 78.233f))) * 43758.5453f);
}

vec3 getViewPos(float depth)
{
	// map from (0, 1) to (-1, 1)
    vec4 clipPos = vec4(texUV * 2.0 - 1.0,  depth * 2.0 - 1.0,  1.0);
    vec4 viewPos = inverse(proj) * clipPos;
    viewPos /= viewPos.w;

    return viewPos.rgb;
}

void main()
{
    float fragDepth = texture(uTextureData[4], texUV).r;

    const float pi = 3.1415;

    float currAngle = radians(rand(texUV));
    float angleStep = 2.0 * pi / uDirCount;
    float radiusStep = uRadiusScale / uStepCount;

    vec3 viewPos = getViewPos(fragDepth);
    vec3 viewDx = dFdx(viewPos);
    vec3 viewDy = dFdy(viewPos);

    float AO = 0;
    for (int i = 0; i < uDirCount; i++)
    {
        vec2 dir = vec2(cos(currAngle), sin(currAngle));
        vec3 currTan = dir.x * viewDx + dir.y * viewDy;

        float currRad = radiusStep;
        vec3 highestPos = viewPos;
        for (int j = 0; j < uStepCount; j++)
        {
            vec3 currPos = viewPos + currRad * vec3(dir, 0);
            vec4 ndcPos = proj * vec4(currPos, 1.0);
            vec2 newUV = (ndcPos.xy / ndcPos.w + vec2(1.0)) / 2.0;

            float currDepth = texture(uTextureData[4], newUV.xy).r;
            vec3 currViewPos = getViewPos(currDepth);

            if (currViewPos.z > highestPos.z)
                highestPos = currViewPos;

            currRad += radiusStep;
        }
        
        currAngle += angleStep;

        if (highestPos == viewPos) continue;

        vec3 horVec = highestPos - viewPos;
        float horAngle = atan(horVec.z / length(horVec.xy));
        float tanAngle = atan(currTan.z / length(currTan.xy)) + radians(uAngleBias);

        float finalAtt = 1.0 - pow(length(horVec) / uRadiusScale, 2);
        float AOresult = sin(horAngle) - sin(tanAngle);

        if (AOresult < 0.0) continue;
        
        AO += AOresult;
    }
        
    AO /= uDirCount;
    AO = 1.0 - pow(AO, uScaleAO);

    FragColor = vec4(AO,AO,AO, 1.0);
}
