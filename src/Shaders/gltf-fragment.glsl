#ifdef FS
  @{flag:"USE_NORMAL_TEXTURE"}
  uniform sampler2D normalTexture;

  @{default:"white",type:"color"}
  uniform vec4 baseColorFactor;

  @{flag:"USE_BASECOLOR_TEXTURE"}
  uniform sampler2D baseColorTexture;

  @{default:"1"}
  uniform float metallicFactor;

  @{flag:"USE_METALLIC_TEXTURE"}
  uniform sampler2D metallicTexture;

  @{default:"1"}
  uniform float roughnessFactor;

  @{flag:"USE_ROUGHNESS_TEXTURE"}
  uniform sampler2D roughnessTexture;

  @{default:"black",type:"color"}
  uniform vec3 emissiveFactor;

  @{flag:"USE_EMISSIVE_TEXTURE"}
  uniform sampler2D emissiveTexture;

  @{flag:"USE_METALLIC_ROUGHNESS_TEXTURE"}
  uniform sampler2D metallicRoughnessTexture;

  @{flag:"USE_OCCLUSION_TEXTURE"}
  uniform sampler2D occlusionTexture;

  @CAMERA_POSITION
  uniform vec3 _cameraPosition;

  @import "forward-shading"

  #ifndef POST_SHADING_SURFACE_FUNCTION
    #define POST_SHADING_SURFACE_FUNCTION postShadingSurfaceFunction

    vec4 postShadingSurfaceFunction(vec4 result,vec4 baseColor,vec3 normal,vec3 position){
        return result;
    }
  #endif

    #ifndef PRE_SHADING_SURFACE_FUNCTION
    #define PRE_SHADING_SURFACE_FUNCTION preShadingSurfaceFunction

    vec4 preShadingSurfaceFunction(vec4 baseColor,vec3 normal,vec3 position){
        return baseColor;
    }
  #endif

  void main(){
    vec4 baseColor = baseColorFactor;
    float occlusion = 1.0;
    #ifdef USE_BASECOLOR_TEXTURE
      baseColor *= texture2D(baseColorTexture,vUV);
    #endif
    #ifdef ATTRIBUTE_COLOR_0_ENABLED
      baseColor.rgb *= vVertexColor;
    #endif
    vec3 emissive = emissiveFactor;
    #ifdef USE_EMISSIVE_TEXTURE
      emissive *= texture2D(emissiveTexture,vUV).rgb;
    #endif
    float metallic = metallicFactor;
    #ifdef USE_METALLIC_TEXTURE
      metallic *= texture2D(metallicTexture,vUV).r;
    #endif
    float roughness = roughnessFactor;
    #ifdef USE_ROUGHNESS_TEXTURE
      roughness *= texture2D(roughnessTexture,vUV).r;
    #endif
    #ifdef USE_METALLIC_ROUGHNESS_TEXTURE
      vec3 rm = texture2D(metallicRoughnessTexture,vUV).rgb;
      metallic *= rm.b;
      roughness *= rm.g;
    #endif
    vec3 normal = normalize(vNormal);
    #ifdef USE_NORMAL_TEXTURE
      #ifndef ATTRIBUTE_TANGENT_ENABLED
      vec3 pos_dx = dFdx(vPosition);
      vec3 pos_dy = dFdy(vPosition);
      vec3 tex_dx = dFdx(vec3(vUV, 0.0));
      vec3 tex_dy = dFdy(vec3(vUV, 0.0));
      vec3 t = (tex_dy.t * pos_dx - tex_dx.t * pos_dy) / (tex_dx.s * tex_dy.t - tex_dy.s * tex_dx.t);
      t = normalize(t - vNormal * dot(vNormal, t));
      #endif
      #ifdef ATTRIBUTE_TANGENT_ENABLED
      vec3 t = vTangent;
      #endif
      vec3 b = normalize(cross(vNormal, t));
      mat3 tbn = mat3(t, b, vNormal);
      vec3 n = texture2D(normalTexture, vUV).rgb;
      normal = normalize(tbn * (2.0 * n - 1.0));
    #endif
    #ifdef CONTEXT_STATE_CULL
    #if (CONTEXT_STATE_CULL == 0)
    normal *= (float(gl_FrontFacing) - 0.5) * 2.0;
    #endif
    #endif
    baseColor = PRE_SHADING_SURFACE_FUNCTION(baseColor,normal,vPosition);
    vec3 dielectricSpecular = vec3(0.04);
    vec3 diffuse = mix(baseColor.rgb * (1. - dielectricSpecular.r),vec3(0),metallic);
    vec3 f0 = mix(dielectricSpecular,baseColor.rgb,metallic);
    float alpha = roughness * roughness;
    pbr_params param = pbr_params(baseColor.rgb,diffuse,f0,alpha,roughness,metallic);
    vec3 shadeResult = shading(param,normal,vPosition);
    shadeResult += emissive;
    #ifdef USE_OCCLUSION_TEXTURE
      occlusion = texture2D(occlusionTexture,vUV).r;
    #endif
    shadeResult *= occlusion;
    gl_FragColor = POST_SHADING_SURFACE_FUNCTION(vec4(shadeResult,baseColor.a),baseColor,normal,vPosition);
  }
#endif