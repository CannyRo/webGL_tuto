console.log("Hello WebGL");

let squareRotation = 0.0; //// ##__AJOUT TUTO 04__## ////
let cubeRotation = 0.0; //// ##__AJOUT TUTO 05__## ////
let deltaTime = 0; //// ##__AJOUT TUTO 04__## ////

main();
//
// Début ici
//
function main() {
    const canvas = document.querySelector("#glCanvas");
    // Initialisation du contexte WebGL
    const gl = canvas.getContext("webgl");
    // Continuer seulement si WebGL est disponible et fonctionnel
    if (!gl) {
        alert(
        "Impossible d'initialiser WebGL. Votre navigateur ou votre machine peut ne pas le supporter.",
        );
        return;
    }

    // Définir la couleur d'effacement comme étant le noir, complètement opaque = le fond
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Effacer le tampon de couleur avec la couleur d'effacement spécifiée
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //// ##__AJOUT TUTO 02__## ////
    // Programme shader de sommet = vertex shader
    // const vsSource = `
    // attribute vec4 aVertexPosition;

    // uniform mat4 uModelViewMatrix;
    // uniform mat4 uProjectionMatrix;

    // void main() {
    //     gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    // }
    // `;
    //// ##__AJOUT TUTO 03__## ////
    // Programme shader de sommet = vertex shader
    // const vsSource = `
    // attribute vec4 aVertexPosition;
    // attribute vec4 aVertexColor;

    // uniform mat4 uModelViewMatrix;
    // uniform mat4 uProjectionMatrix;

    // varying lowp vec4 vColor;

    // void main(void) {
    //     gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    //     vColor = aVertexColor;
    // }
    // `;
    //// ##__AJOUT TUTO 06__## ////
    // Programme shader de sommet = vertex shader
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

    //// ##__AJOUT TUTO 02__## ////
    // Programme shader de fragment = fragment shader
    // const fsSource = `
    // void main() {
    //     gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    // }
    // `;
    //// ##__AJOUT TUTO 03__## ////
    // Programme shader de fragment = fragment shader
    // const fsSource = `
    //     varying lowp vec4 vColor;

    //     void main(void) {
    //         gl_FragColor = vColor;
    //     }
    // `;
    //// ##__AJOUT TUTO 06__## ////
    // Programme shader de fragment = fragment shader
    const fsSource = `
      varying highp vec2 vTextureCoord;

      uniform sampler2D uSampler;

      void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
      }
    `;

    // Initialiser un programme de shader 
    // c'est là que tous les éclairages pour les sommets et ainsi de suite sont établis.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    // Rassembler toutes les informations nécessaires à l'utilisation du programme de shader.
    //Recherchez l'attribut que notre programme de shader utilise pour aVertexPosition 
    // et recherchez les emplacements des uniformes.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
          // vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'), // <<<<==== //// ##__AJOUT TUTO 03__## ////
          textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"), // <<<<==== //// ##__AJOUT TUTO 06__## ////
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
          modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
          uSampler: gl.getUniformLocation(shaderProgram, "uSampler"), // <<<<==== //// ##__AJOUT TUTO 06__## ////
        },
    };
    // Ici on appelle la routine qui va construire
    // tous les object qui seront dessinés
    const buffers = initBuffers(gl);
    //// ##__AJOUT TUTO 06__## ////
    // Load texture
    const texture = loadTexture(gl, "cubetexture.png");
    // Flip image pixels into the bottom-to-top order that WebGL expects.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // on renverse l'image pour qu'elle apparaisse NON inversée/miroir
    //// ##__AJOUT TUTO 04__## //// nouvelle variable pour mémoriser l'instant auquel nous avons réalisé l'animation pour la dernière fois
    let then = 0;

    // On dessine la scène
    //drawScene(gl, programInfo, buffers);
    
    //// ##__AJOUT TUTO 04__## ////
    // Dessiner la scène répétitivement
    function render(now) {
        now *= 0.001; // conversion en secondes
        const deltaTime = now - then;
        then = now;
    
        // drawScene(gl, programInfo, buffers, squareRotation);
        //// ##__AJOUT TUTO 05__## //// change square with cube
        drawScene(gl, programInfo, buffers, texture, cubeRotation);
        // squareRotation += deltaTime;
        cubeRotation += deltaTime;
    
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

//// ##__AJOUT TUTO 02__## ////
// Initialiser un programme shader, de façon à ce que WebGL sache comment dessiner nos données
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    // Créer le programme shader
  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // Si la création du programme shader a échoué, alerte
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(
        "Impossible d'initialiser le programme shader : " +
          gl.getProgramInfoLog(shaderProgram),
      );
      return null;
    }
  
    return shaderProgram;
}
//
// Crée un shader du type fourni, charge le source et le compile.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
  
    // Envoyer le source à l'objet shader
  
    gl.shaderSource(shader, source);
  
    // Compiler le programme shader
  
    gl.compileShader(shader);
  
    // Vérifier s'il a ét compilé avec succès
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(
        "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader),
      );
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
}
//// ##__AJOUT TUTO 06__## ////
// Initialiser une texture et charger une image.
// Quand le chargement d'une image est terminé, la copier dans la texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Du fait que les images doivent être téléchargées depuis l'internet,
  // il peut s'écouler un certain temps avant qu'elles ne soient prêtes.
  // Jusque là, mettre un seul pixel dans la texture, de sorte que nous puissions
  // l'utiliser immédiatement. Quand le téléchargement de la page sera terminé,
  // nous mettrons à jour la texture avec le contenu de l'image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // bleu opaque
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel,
  );

  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image,
    );
    // WebGL1 a des spécifications différentes pour les images puissances de 2
    // par rapport aux images non puissances de 2 ; aussi vérifier si l'image est une
    // puissance de 2 sur chacune de ses dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Oui, c'est une puissance de 2. Générer les mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // Non, ce n'est pas une puissance de 2. Désactiver les mips et définir l'habillage
      // comme "accrocher au bord"
      // Empêcher l'habillage selon la coordonnée s (répétition).
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      // Empêcher l'habillage selon la coordonnée t (répétition).
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      // gl.NEAREST est aussi permis, au lieu de gl.LINEAR, du fait qu'aucun ne fait de mipmap.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}
//// ##__AJOUT TUTO 06__## ////
// Utilitaire
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}
//
// Créer un tampon qui contiendra les positions des sommets utilisés pour le rendu 
//
function initBuffers(gl) {
    // Créer un tampon des positions pour le carré.
    const positionBuffer = initPositionBuffer(gl);
    //// ##__AJOUT TUTO 03__## ////
    // Créer un tampon des couleurs pour le carré.
    // const colorBuffer = initColorBuffer(gl);

    //// ##__AJOUT TUTO 06__## ////
    // on remplace le tampon de couleur par le tampon de texture
    const textureCoordBuffer = initTextureBuffer(gl);

    //// ##__AJOUT TUTO 05__## ////
    // Créer un tampon des index pour le cube.
    const indexBuffer = initIndexBuffer(gl);

    return {
      position: positionBuffer,
      //// ##__AJOUT TUTO 03__## ////
      // color: colorBuffer,
      //// ##__AJOUT TUTO 06__## //// color remplacé par texture
      textureCoord: textureCoordBuffer,
      //// ##__AJOUT TUTO 05__## ////
      indices: indexBuffer,
    };
}
//
// Tampon de positions
//
function initPositionBuffer(gl) {
    // Créer un tampon des positions pour le carré.
    const positionBuffer = gl.createBuffer();
  
    // Définir le positionBuffer comme étant celui auquel appliquer les opérations
    // de tampon à partir d'ici.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    // Créer maintenant un tableau des positions pour le carré.
    // const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    //// ##__AJOUT TUTO 05__## ////
    const positions = [
      // Face avant
      -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    
      // Face arrière
      -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
    
      // Face supérieure
      -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
    
      // Face inférieure
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    
      // Face droite
      1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
    
      // Face gauche
      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ];
  
    // Passer mainenant la liste des positions à WebGL pour construire la forme.
    // Nous faisons cela en créant un Float32Array à partir du tableau JavaScript,
    // puis en l'utilisant pour remplir le tampon en cours.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
    return positionBuffer;
}
//
// Tampon de couleurs
//
function initColorBuffer(gl) {
    // Création des couleurs, ici une couleur différente pour chacun des quatres sommet du carré 2D
    //
    // const colors = [
    //     //R   //G   //B   //A
    //     1.0,  1.0,  1.0,  1.0,    // = blanc
    //     1.0,  0.0,  0.0,  1.0,    // = rouge
    //     0.0,  1.0,  0.0,  1.0,    // = vert
    //     0.0,  0.0,  1.0,  1.0,    // = bleu
    // ];
    //// ##__AJOUT TUTO 05__## ////
    const faceColors = [
      [1.0, 1.0, 1.0, 1.0], // Face avant : blanc
      [1.0, 0.0, 0.0, 1.0], // Face arrière : rouge
      [0.0, 1.0, 0.0, 1.0], // Face supérieure : vert
      [0.0, 0.0, 1.0, 1.0], // Face infiérieure : bleu
      [1.0, 1.0, 0.0, 1.0], // Face droite : jaune
      [1.0, 0.0, 1.0, 1.0], // Face gauche : violet
    ];
    // Conversion du tableau des couleurs en une table pour tous les sommets
    let colors = [];
    for (let j = 0; j < faceColors.length; j++) {
      const c = faceColors[j];
      // Répéter chaque couleur quatre fois pour les quatre sommets d'une face
      colors = colors.concat(c, c, c, c);
    }
  
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
    return colorBuffer;
}
//// ##__AJOUT TUTO 05__## ////
// Tampon des éléments
//
function initIndexBuffer(gl) {
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // Ce tableau définit chaque face comme deux triangles, en utilisant les
  // indices dans le tableau des sommets pour spécifier la position de chaque
  // triangle.
  const indices = [
    0,  1,  2,      0,  2,  3,    // avant
    4,  5,  6,      4,  6,  7,    // arrière
    8,  9,  10,     8,  10, 11,   // haut
    12, 13, 14,     12, 14, 15,   // bas
    16, 17, 18,     16, 18, 19,   // droite
    20, 21, 22,     20, 22, 23,   // gauche
  ];
  // Envoyer maintenant le tableau des éléments à GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices), gl.STATIC_DRAW);

    return  indexBuffer;
}
//// ##__AJOUT TUTO 06__## ////
// Tampon des textures
//
function initTextureBuffer(gl) {
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureCoordinates),
    gl.STATIC_DRAW
  );

  return textureCoordBuffer;
}
//
// Fonction pour dessiner le rendu final grâce à la définition préalable
// des programmes shader, des emplacements et positions des sommets stockés dans le tampon
//
function drawScene(gl, programInfo, buffers, texture, cubeRotation) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // effacement en noir, complètement opaque
    gl.clearDepth(1.0); // tout effacer
    gl.enable(gl.DEPTH_TEST); // activer le test de profondeur
    gl.depthFunc(gl.LEQUAL); // les choses proches cachent les choses lointaines
  
    // Effacer le canevas avant que nous ne commencions à dessiner dessus.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Créer une matrice de perspective, une matrice spéciale qui est utilisée pour
    // simuler la distorsion de la perspective dans une caméra.
    // Notre champ de vision est de 45 degrés, avec un rapport largeur/hauteur qui
    // correspond à la taille d'affichage du canvas ;
    // et nous voulons seulement voir les objets situés entre 0,1 unité et 100 unités
    // à partir de la caméra.
  
    const fieldOfView = (45 * Math.PI) / 180; // en radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    // note: glmatrix.js a toujours comme premier argument la destination
    // où stocker le résultat.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  
    // Définir la position de dessin comme étant le point "origine", qui est
    // le centre de la scène.
    const modelViewMatrix = mat4.create();
  
    // Commencer maintenant à déplacer la position de dessin un peu vers là où
    // nous voulons commencer à dessiner le carré.
    mat4.translate(
      modelViewMatrix, // matrice de destination
      modelViewMatrix, // matrice de déplacement
      [-0.0, 0.0, -6.0],
    ); // quantité de déplacement

    //// ##__AJOUT TUTO 04__## //// ==> Rotation
    mat4.rotate(
        modelViewMatrix, // matrice de destination
        modelViewMatrix, // matrice de rotation
        //squareRotation, // rotation en radians
        //// ##__AJOUT TUTO 05__## ////
        cubeRotation,
        [0, 0, 1], // [ xAxe, yAxe, zAxe]
    ); // axe autour duquel tourner (ici l'axe de rotation est l'axe Z)
    //// ##__AJOUT TUTO 05__## //// Ajout d'un rotation sur l'axe de X
    mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      cubeRotation * 0.7, // amount to rotate in radians
      [1, 0, 0]
    ); // axe autour duquel tourner (ici l'axe de rotation est l'axe X)
    mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      cubeRotation * 0.3, // amount to rotate in radians
      [0, 1, 0]
    ); // axe autour duquel tourner (ici l'axe de rotation est l'axe Y)
    // Dire à WebGL comment extraire les positions du tampon  
    // de position dans l'attribut vertexPosition.
    setPositionAttribute(gl, buffers, programInfo);
    //// ##__AJOUT TUTO 03__## ////
    // Dire à WebGL comment extraire les couleurs du tampon  
    // de couleurs dans l'attribut vertexColor.
    //setColorAttribute(gl, buffers, programInfo);
    //// ##__AJOUT TUTO 06__## ////
    // Dire à WebGL comment extraire les couleurs du tampon  
    // de couleurs dans l'attribut vertexColor.
    setTextureAttribute(gl, buffers, programInfo);

    //// ##__AJOUT TUTO 05__## ////
    // Indiquer à WebGL quels indices utiliser pour indexer les sommets
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Indiquer à WebGL d'utiliser notre programme pour dessiner
    gl.useProgram(programInfo.program);

    // Définir les uniformes du shader
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix,
    );
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix,
    );
    //// ##__AJOUT TUTO 06__## ////
    // Indiquer à WebGL que nous voulons affecter l'unité de texture 0
    gl.activeTexture(gl.TEXTURE0);
    // Lier la texture à l'unité de texture 0
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Indiquer au shader que nous avons lié la texture à l'unité de texture 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
  
    // {
    //   const offset = 0;
    //   const vertexCount = 4;
    //   gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    // }
    //// ##__AJOUT TUTO 05__## ////
    {
      const vertexCount = 36;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}
//
// Indiquer à WebGL comment extraire les positions à partir du tampon des
// positions pour les mettre dans l'attribut vertexPosition.
function setPositionAttribute(gl, buffers, programInfo) {
    // const numComponents = 2; // extraire 2 valeurs par itération
    //// ##__AJOUT TUTO 05__## ////
    const numComponents = 3; // extraire 3 valeurs par itération
    const type = gl.FLOAT; // les données dans le tampon sont des flottants 32bit
    const normalize = false; // ne pas normaliser
    const stride = 0; // combien d'octets à extraire entre un jeu de valeurs et le suivant
    // 0 = utiliser le type et numComponents ci-dessus
    const offset = 0; // démarrer à partir de combien d'octets dans le tampon
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}
//// ##__AJOUT TUTO 03__## ////
// Indiquer à WebGL comment transférer les couleurs du tampon des couleurs
// dans l'attribut vertexColor.
function setColorAttribute(gl, buffers, programInfo){
    const numComponents = 4; // extraire 4 valeurs par itération
    const type = gl.FLOAT; // les données dans le tampon sont des flottants 32bit
    const normalize = false; // ne pas normaliser
    const stride = 0; // combien d'octets à extraire entre un jeu de valeurs et le suivant
    // 0 = utiliser le type et numComponents ci-dessus
    const offset = 0; // démarrer à partir de combien d'octets dans le tampon
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}
//// ##__AJOUT TUTO 06__## ////
// Indiquer à WebGL comment extraire les coordonnées de texture du tampon
// 
function setTextureAttribute(gl, buffers, programInfo) {
  const num = 2; // chaque coordonnée est composée de 2 valeurs
  const type = gl.FLOAT; // les données dans le tampon sont des flottants 32 bits
  const normalize = false; // ne pas normaliser
  const stride = 0; // combien d'octets à récupérer entre un jeu et le suivant
  const offset = 0; // à combien d'octets du début faut-il commencer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
  gl.vertexAttribPointer(
    programInfo.attribLocations.textureCoord,
    num,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}