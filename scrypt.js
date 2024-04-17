console.log("Hello WebGL");

let squareRotation = 0.0; //// ##__AJOUT TUTO 04__## ////
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
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
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
    const fsSource = `
        varying lowp vec4 vColor;

        void main(void) {
            gl_FragColor = vColor;
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
          vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'), // <<<<==== //// ##__AJOUT TUTO 03__## ////
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
          modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
        },
    };
    // Ici on appelle la routine qui va construire
    // tous les object qui seront dessinés
    const buffers = initBuffers(gl);
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
    
        drawScene(gl, programInfo, buffers, squareRotation);
        squareRotation += deltaTime;
    
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
//
// Créer un tampon qui contiendra les positions des sommets utilisés pour le rendu 
//
function initBuffers(gl) {
    // Créer un tampon des positions pour le carré.
    const positionBuffer = initPositionBuffer(gl);
    //// ##__AJOUT TUTO 03__## ////
    // Créer un tampon des couleurs pour le carré.
    const colorBuffer = initColorBuffer(gl);

    return {
      position: positionBuffer,
      //// ##__AJOUT TUTO 03__## ////
      color: colorBuffer,
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
    const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  
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
    const colors = [
        //R   //G   //B   //A
        1.0,  1.0,  1.0,  1.0,    // = blanc
        1.0,  0.0,  0.0,  1.0,    // = rouge
        0.0,  1.0,  0.0,  1.0,    // = vert
        0.0,  0.0,  1.0,  1.0,    // = bleu
    ];
  
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
    return colorBuffer;
}
//
// Fonction pour dessiner le rendu final grâce à la définition préalable
// des programmes shader, des emplacements et positions des sommets stockés dans le tampon
//
function drawScene(gl, programInfo, buffers) {
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
        squareRotation, // rotation en radians
        [0, 0, 1], // [ xAxe, yAxe, zAxe]
    ); // axe autour duquel tourner (ici l'axe de rotation est l'axe Z)

    // Dire à WebGL comment extraire les positions du tampon  
    // de position dans l'attribut vertexPosition.
    setPositionAttribute(gl, buffers, programInfo);
    //// ##__AJOUT TUTO 03__## ////
    // Dire à WebGL comment extraire les couleurs du tampon  
    // de couleurs dans l'attribut vertexColor.
    setColorAttribute(gl, buffers, programInfo);

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
  
    {
      const offset = 0;
      const vertexCount = 4;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}
//
// Indiquer à WebGL comment extraire les positions à partir du tampon des
// positions pour les mettre dans l'attribut vertexPosition.
function setPositionAttribute(gl, buffers, programInfo) {
    const numComponents = 2; // extraire 2 valeurs par itération
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
