#version 400 core

// --------------------- IN ---------------------
in vec2 texUV;

// --------------------- OUT --------------------
layout(location = 0) out vec4 FragColor;

// ------------------- UNIFORM ------------------
uniform sampler2D uTextureData[4];
uniform sampler2D uShadowMaps[3];

uniform vec3 uLightDir;
uniform vec4 uLightCol;

uniform vec3 uViewPos;

uniform mat4 view;
uniform mat4 lightMtx[3];

uniform float uNear;
uniform float uFar;

uniform float uNearDist[3];
uniform float uFarDist[3];

uniform int uPCFSamples;
uniform float uBias;

uniform bool uShowLayers;

float getPCFShadow(vec4 light_SurfacePos, int layer)
{
    vec3 projCoords = light_SurfacePos.xyz / light_SurfacePos.w;
    projCoords = projCoords * 0.5 + 0.5;

    float currentDepth = projCoords.z;
    if (currentDepth  > 1.0)
        return 0.0;

    vec3 normal = normalize(texture(uTextureData[1], texUV).rgb);
	float newBias = uBias / light_SurfacePos.w * 0.005f;
    
    // PCF
	float sampleCount = 0.0f;
	int neighbor = uPCFSamples / 2;
    float accumulatedVisibility = 0.0;
    vec2 texelSize = 1.0 / vec2(textureSize(uShadowMaps[layer], 0));
    for(int x = -neighbor; x <= neighbor; ++x)
    {
        for(int y = -neighbor; y <= neighbor; ++y)
        {
            float pcfDepth = texture(uShadowMaps[layer], vec2(projCoords.xy + vec2(x, y) * texelSize)).r; 
            accumulatedVisibility += (currentDepth - newBias) > pcfDepth ? 1.0 : 0.0;    
			sampleCount++;    
        }    
    }

    if(light_SurfacePos.z > 1.0)
        accumulatedVisibility = 0.0;

	return accumulatedVisibility / sampleCount;
}

void main()
{
	vec3 diffuseTexel  = texture(uTextureData[0], texUV).rgb;
	vec3 normalTexel   = texture(uTextureData[1], texUV).rgb;
	vec3 specularTexel = texture(uTextureData[2], texUV).rgb;
	vec4 positionTexel = texture(uTextureData[3], texUV);
	
	float currDepth = abs((view * vec4(positionTexel.rgb, 1.0)).z);
	int currLayer = 1;
	for (int i = 0; i < 3; i++)
	{
		float maxDepth = uNear + (i + 1.0) / 3.0 * (uFar - uNear); // Linearly interpolated cascades, could be expanded
		if (currDepth < maxDepth)
		{
			currLayer = i;
			break;
		}
	}

	vec4 lightFragPos = lightMtx[currLayer] * vec4(positionTexel.rgb, 1.0);
	float pcfShadow = 0.0;
	vec3 col = vec3(0.0f);
    
    if (currLayer > 0 && currDepth <= uFarDist[currLayer - 1] && currDepth >= uNearDist[currLayer])
    {
        float lerpVal = (currDepth - uNearDist[currLayer]) / (uFarDist[currLayer - 1] - uNearDist[currLayer]);

        if (uShowLayers)
        {
	        col[currLayer - 1] = 1.0 - lerpVal;
	        col[currLayer] = lerpVal;
        }
        else
        {
            vec4 otherLightFragPos = lightMtx[currLayer - 1] * vec4(positionTexel.rgb, 1.0);
            float shadow0 = (1.0 - lerpVal) * getPCFShadow(otherLightFragPos, currLayer - 1);
            float shadow1 = lerpVal * getPCFShadow(lightFragPos, currLayer);
            pcfShadow = 1.0 - (shadow0 + shadow1);
        }
    }
    else if (currLayer < 2 && currDepth <= uFarDist[currLayer] && currDepth >= uNearDist[currLayer + 1])
    {
        float lerpVal = (currDepth - uNearDist[currLayer + 1]) / (uFarDist[currLayer] - uNearDist[currLayer + 1]);

        if (uShowLayers)
        {
	        col[currLayer] = 1.0 - lerpVal;
	        col[currLayer + 1] = lerpVal;
        }
        else
        {
            vec4 otherLightFragPos = lightMtx[currLayer + 1] * vec4(positionTexel.rgb, 1.0);
            float shadow0 = (1.0 - lerpVal) * getPCFShadow(lightFragPos, currLayer);
            float shadow1 = lerpVal * getPCFShadow(otherLightFragPos, currLayer + 1);
            pcfShadow = 1.0 - (shadow0 + shadow1);
        }
    }
    else
    {
        if (uShowLayers)
	        col[currLayer] = 1.0f;
        else
            pcfShadow = 1.0f - getPCFShadow(lightFragPos, currLayer);
    }

	float ns = specularTexel.g;
    float specular = specularTexel.b;

    // specular
    vec3 diff = max(dot(-normalize(uLightDir), normalTexel), 0.0) * uLightCol.rgb * diffuseTexel;

    // specular
    vec3 viewDir = normalize(uViewPos - positionTexel.rgb);
    vec3 halfwayDir = normalize(-normalize(uLightDir) + viewDir);  
    vec3 spec = pow(max(dot(normalTexel, halfwayDir), 0.0), ns) * specular * uLightCol.rgb * diffuseTexel;         
    vec3 result = pcfShadow * (diff + spec);    
    
    if (uShowLayers)
		FragColor = vec4(col, positionTexel.a);
    else
        FragColor = vec4(result, 1.0);
}
