// Please do not change the name of variable on the line below.
import GrimoireInterface from "grimoirejs";
// IMPORTS would be replaced for importing components.
//<%=IMPORTS%>

import GLTFParser from "./Parser/GLTFParser";
GrimoireInterface.register(async () => {
  // REGISTER would be replaced to actual codes to register components.
  //<%=REGISTER%>

  // You can edit code here.
  GrimoireInterface.registerNode("model", ["Transform", "GLTFModel"]);
  GrimoireInterface.registerNode("gltf-mesh", ["Transform", "MaterialContainer", "MeshRenderer"]);
});
