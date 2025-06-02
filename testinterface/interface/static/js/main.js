// Logfunctie met template string fix
function addLog(message) {
  const logList = document.getElementById('log-list');
  if (!logList) return;
  const entry = document.createElement('li');
  const timestamp = new Date().toLocaleTimeString();
  entry.textContent = `[${timestamp}] ${message}`;
  logList.appendChild(entry);
  logList.scrollTop = logList.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('viewer');
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  // Licht
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  // Grid helper
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  // Assenhelper
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // Kubus
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshPhongMaterial({ color: 0x156289 });
  const cube = new THREE.Mesh(geometry, material);
  cube.scale.set(2, 2, 2);
  scene.add(cube);

  // Animatie loop
  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
});

// // Three.js setup en globale variabelen
// let scene, camera, renderer;

// function initThreeJS() {
//   const canvas = document.getElementById('viewer');
//   renderer = new THREE.WebGLRenderer({ canvas });
//   renderer.setSize(canvas.clientWidth, canvas.clientHeight);

//   scene = new THREE.Scene();
//   scene.background = new THREE.Color(0xffffff);

//   camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
//   camera.position.set(5, 5, 5);
//   camera.lookAt(0, 0, 0);

//   const light = new THREE.DirectionalLight(0xffffff, 1);
//   light.position.set(5, 5, 5);
//   scene.add(light);

//   const gridHelper = new THREE.GridHelper(10, 10);
//   scene.add(gridHelper);

//   const axesHelper = new THREE.AxesHelper(5);
//   scene.add(axesHelper);

//   animate();
// }

// function animate() {
//   requestAnimationFrame(animate);
//   renderer.render(scene, camera);
// }

// // Visualiseer voxels als cubes, voorbeeld: voxel > drempel waarde
// function visualizeVolume(voxels) {
//   // Eerst oude voxel cubes verwijderen
//   for (let i = scene.children.length - 1; i >= 0; i--) {
//     const obj = scene.children[i];
//     if (obj.userData.isVoxelCube) {
//       scene.remove(obj);
//       obj.geometry.dispose();
//       obj.material.dispose();
//     }
//   }

//   const geometry = new THREE.BoxGeometry(1, 1, 1);
//   const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });

//   for (let z = 0; z < voxels.length; z++) {
//     for (let y = 0; y < voxels[z].length; y++) {
//       for (let x = 0; x < voxels[z][y].length; x++) {
//         if (voxels[z][y][x] > 30) {  // drempelwaarde, pas aan naar jouw data
//           const cube = new THREE.Mesh(geometry, material);
//           cube.position.set(x, y, z);
//           cube.userData.isVoxelCube = true;
//           scene.add(cube);
//         }
//       }
//     }
//   }
//   addLog(`Visualisatie: ${voxels.length} slices geladen.`);
// }

// document.addEventListener('DOMContentLoaded', () => {
//   initThreeJS();

//   const uploadForm = document.getElementById('dicom-upload-form');
//   uploadForm.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const files = document.getElementById('dicom_files').files;
//     if (files.length === 0) {
//       alert('Selecteer eerst één of meerdere DICOM-bestanden.');
//       return;
//     }

//     const formData = new FormData();
//     for (const file of files) {
//       formData.append('dicom_files', file);
//     }

//     try {
//         addLog("Upload gestart...");

//         const response = await fetch('/upload-dicom/', {
//             method: 'POST',
//             body: formData,
//         });

//         if (!response.ok) throw new Error('Upload mislukt');

//         const data = await response.json();
//         addLog(data.message || "DICOM succesvol geüpload en verwerkt.");
//         visualizeVolume(data.voxels);
//         } catch (error) {
//         addLog("Fout bij upload of verwerking: " + error.message);
//     }
//   });
// });

// function visualizeVolume(volumeData) {
//     // volumeData is 3D array: [z][y][x]

//     const container = document.getElementById('vtk-viewer');
//     container.innerHTML = ''; // Clear oude rendering

//     // Maak VTK.js renderer, renderWindow, interactor
//     const vtkFullScreenRenderWindow = vtk.Rendering.Misc.vtkFullScreenRenderWindow;
//     const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({ rootContainer: container, containerStyle: { height: '600px', width: '800px' } });
//     const renderer = fullScreenRenderer.getRenderer();
//     const renderWindow = fullScreenRenderer.getRenderWindow();

//     // Zet camera
//     const camera = renderer.getActiveCamera();
//     camera.setPosition(0, 0, 500);
//     camera.setFocalPoint(0, 0, 0);
//     camera.setViewUp(0, -1, 0);

//     // Maak vtkImageData van volumeData
//     const vtkImageData = vtk.Common.DataModel.vtkImageData.newInstance();

//     // Zet dimensies (x,y,z)
//     const dims = [volumeData[0][0].length, volumeData[0].length, volumeData.length];  // width, height, depth

//     vtkImageData.setDimensions(dims);

//     // Flatten de 3D array naar 1D array
//     const scalars = new Uint8Array(dims[0] * dims[1] * dims[2]);

//     let idx = 0;
//     for (let z = 0; z < dims[2]; z++) {
//         for (let y = 0; y < dims[1]; y++) {
//             for (let x = 0; x < dims[0]; x++) {
//                 let val = volumeData[z][y][x];
//                 scalars[idx++] = val; // Pas eventueel schaal of threshold aan
//             }
//         }
//     }

//     vtkImageData.getPointData().setScalars(vtk.Common.Core.vtkDataArray.newInstance({
//         numberOfComponents: 1,
//         values: scalars,
//         dataType: 'Uint8Array',
//         name: 'Scalars'
//     }));

//     // Maak volume mapper
//     const volumeMapper = vtk.Rendering.Core.vtkVolumeMapper.newInstance();
//     volumeMapper.setSampleDistance(0.7);
//     volumeMapper.setInputData(vtkImageData);

//     // Volume property (transfer functions)
//     const volumeProperty = vtk.Rendering.Core.vtkVolumeProperty.newInstance();

//     // Opaciteit en kleur (transfer functions)
//     const ctfun = vtk.Rendering.Core.vtkColorTransferFunction.newInstance();
//     ctfun.addRGBPoint(0, 0, 0, 0);
//     ctfun.addRGBPoint(255, 1, 1, 1);

//     const ofun = vtk.Rendering.Core.vtkPiecewiseFunction.newInstance();
//     ofun.addPoint(0, 0);
//     ofun.addPoint(255, 0.8);

//     volumeProperty.setRGBTransferFunction(0, ctfun);
//     volumeProperty.setScalarOpacity(0, ofun);
//     volumeProperty.setInterpolationTypeToLinear();

//     // Maak volume actor
//     const volume = vtk.Rendering.Core.vtkVolume.newInstance();
//     volume.setMapper(volumeMapper);
//     volume.setProperty(volumeProperty);

//     // Voeg volume toe aan scene
//     renderer.addVolume(volume);
//     renderer.resetCamera();
//     renderWindow.render();

//     // Interactor om te kunnen roteren etc.
//     const interactor = renderWindow.getInteractor();
//     interactor.initialize();
//     interactor.bindEvents(container);
// }
