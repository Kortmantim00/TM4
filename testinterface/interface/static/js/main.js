// 🛡️ CSRF-token ophalen voor veilige POST-verzoeken
function getCSRFToken() {
  return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// 🧾 Logregel toevoegen met timestamp
function addLog(message) {
  const logList = document.getElementById('log-list');
  if (!logList) return;
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('li');
  entry.textContent = `[${timestamp}] ${message}`;
  logList.appendChild(entry);
  logList.scrollTop = logList.scrollHeight;
}

//
// 🔲 Viewer Setup en Rendering
//

// Viewer aanmaken voor 2D of 3D interactie
function createViewer(containerId, interactorStyle = '2D') {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // 🔄 Maak container leeg

  const renderWindow = vtk.Rendering.Core.vtkRenderWindow.newInstance();
  const renderer = vtk.Rendering.Core.vtkRenderer.newInstance();
  renderWindow.addRenderer(renderer);

  const openGLRenderWindow = vtk.Rendering.OpenGL.vtkRenderWindow.newInstance();
  openGLRenderWindow.setContainer(container);
  renderWindow.addView(openGLRenderWindow);
  openGLRenderWindow.setSize(container.clientWidth, container.clientHeight);

  const interactor = vtk.Rendering.Core.vtkRenderWindowInteractor.newInstance();
  interactor.setView(openGLRenderWindow);
  interactor.initialize();
  interactor.bindEvents(container);

  if (interactorStyle === '2D') {
    interactor.setInteractorStyle(vtk.Interaction.Style.vtkInteractorStyleImage.newInstance());
  } else {
    interactor.setInteractorStyle(vtk.Interaction.Style.vtkInteractorStyleTrackballCamera.newInstance());
  }
  return { renderer, renderWindow };
}

// 2D/3D weergaves laden met volumeData
function loadVolumeToViewers(volumeData) {
  const imageData = vtk.Common.DataModel.vtkImageData.newInstance();
  imageData.setDimensions(volumeData.dimensions);

  if (volumeData.spacing) {
    imageData.setSpacing(...volumeData.spacing);
  } else {
    imageData.setSpacing(1, 1, 1);
  }

  const dataArray = vtk.Common.Core.vtkDataArray.newInstance({
    name: 'Scalars',
    values: new Uint8Array(volumeData.data),
  });
  imageData.getPointData().setScalars(dataArray);

  //Mapping van slicing modes
  const slicingModeMap = {
    I: vtk.Rendering.Core.vtkImageMapper.SlicingMode.X,
    J: vtk.Rendering.Core.vtkImageMapper.SlicingMode.Y,
    K: vtk.Rendering.Core.vtkImageMapper.SlicingMode.Z
  };

  const views = [
    { id: 'viewer-3d', style: '3D', mapper: 'volume' },
    { id: 'viewer-axial', mode: 'K' },
    { id: 'viewer-coronal', mode: 'J' },
    { id: 'viewer-sagittal', mode: 'I' }
  ];

  views.forEach(view => {
    const { renderer, renderWindow } = createViewer(view.id, view.style || '2D');

    if (view.mapper === 'volume') {
      const volumeMapper = vtk.Rendering.Core.vtkVolumeMapper.newInstance();
      volumeMapper.setInputData(imageData);
      const volume = vtk.Rendering.Core.vtkVolume.newInstance();
      volume.setMapper(volumeMapper);
      renderer.addVolume(volume);
    } else {
      const mapper = vtk.Rendering.Core.vtkImageMapper.newInstance();
      mapper.setInputData(imageData);

      const slicingMode = slicingModeMap[view.mode];
      mapper.setSlicingMode(slicingMode);

      const sliceIndex = Math.floor(volumeData.dimensions['IJK'.indexOf(view.mode)] / 2);
      mapper.setSliceAtFocalPoint(true);
      mapper.setSlice(sliceIndex);

      const slice = vtk.Rendering.Core.vtkImageSlice.newInstance();
      slice.setMapper(mapper);
      renderer.addViewProp(slice);
    }

    renderer.resetCamera();
    renderWindow.render();
  });
}

//
// 📦 Volume ophalen en visualiseren
//

// DICOM volume ophalen en renderen vanuit JSON
function fetchAndVisualizeVolume() {
  addLog('Start visualisatie van DICOM volume...');

  fetch('/media/volume.json?t=' + new Date().getTime())
    .then(response => {
      if (!response.ok) throw new Error("Bestand bestaat niet of is verwijderd.");
      return response.json();
    })
    .then(data => {
      const voxels = data.voxels;
      const spacing = data.spacing || [1.0, 1.0, 1.0];
      const dims = [voxels[0][0].length, voxels[0].length, voxels.length]; // [x, y, z]
      const flatData = voxels.flat(2); // 3D -> 1D array

      loadVolumeToViewers({ data: flatData, dimensions: dims, spacing: spacing });
      addLog('DICOM volume geladen en gevisualiseerd.');
    })
    .catch(error => {
      console.error('Fout bij laden DICOM volume:', error);
      addLog('Geen DICOM volume gevonden. Mogelijk gereset.');
    });
}

// NIFTI volume ophalen en renderen
function fetchAndVisualizeNifti() {
  addLog('Start visualisatie van NIFTI volume...');

  fetch('/media/volume_nifti.json?t=' + new Date().getTime())  // pas pad aan naar waar jouw server NIFTI json bewaart
    .then(response => {
      if (!response.ok) throw new Error("NIFTI volume niet gevonden");
      return response.json();
    })
    .then(data => {
      const voxels = data.voxels;
      const spacing = data.spacing || [1.0, 1.0, 1.0];
      const dims = [voxels[0][0].length, voxels[0].length, voxels.length]; // [x, y, z]

      // Flatten 3D array in juiste volgorde
      const flatData = new Float32Array(dims[0] * dims[1] * dims[2]);
      let idx = 0;
      for (let z = 0; z < dims[2]; z++) {
        for (let y = 0; y < dims[1]; y++) {
          for (let x = 0; x < dims[0]; x++) {
            flatData[idx++] = voxels[z][y][x];
          }
        }
      }

      const imageData = vtk.Common.DataModel.vtkImageData.newInstance();
      imageData.setDimensions(...dims);
      imageData.setSpacing(...spacing);
      imageData.getPointData().setScalars(
        vtk.Common.Core.vtkDataArray.newInstance({
          numberOfComponents: 1,
          values: flatData,
          dataType: 'Float32Array',
        })
      );

      // 3D viewer setup 
      const container = document.getElementById('viewer-3d');
      container.innerHTML = '';

      const fullScreenRenderer = vtk.Rendering.Misc.vtkFullScreenRenderWindow.newInstance({
        rootContainer: container,
        background: [0, 0, 0],
      });

      const renderer = fullScreenRenderer.getRenderer();
      const renderWindow = fullScreenRenderer.getRenderWindow();

      const volumeMapper = vtk.Rendering.Core.vtkVolumeMapper.newInstance();
      volumeMapper.setInputData(imageData);
      const volume = vtk.Rendering.Core.vtkVolume.newInstance();
      volume.setMapper(volumeMapper);

      renderer.addVolume(volume);
      renderer.resetCamera();
      renderWindow.render();

      addLog('NIFTI volume geladen en gevisualiseerd.');
    })
    .catch(error => {
      console.error('Fout bij laden NIFTI:', error);
      addLog('Fout bij visualiseren NIFTI volume.');
    });
}


//
// 🧩 Gebruikersinteractie
//

// Uploadform verwerken DICOM-bestanden
document.getElementById('dicom-upload-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  addLog('DICOM Bestanden worden geüpload...');
  fetch('/', {
    method: 'POST',
    headers: { 'X-CSRFToken': getCSRFToken() },
    body: formData,
  })
    .then(response => {
      if (response.ok) {
        addLog('DICMO Bestanden succesvol geüpload.');
        fetchAndVisualizeVolume();
      }
    })
    .catch(error => {
      console.error('Upload fout:', error);
      addLog('Upload DICOM mislukt.');
    });
});

// Uploadform verwerken NIFTI-bestanden
document.getElementById('nifti-upload-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  addLog('NIFTI bestand wordt geüpload...');

  fetch('/', {
    method: 'POST',
    headers: { 'X-CSRFToken': getCSRFToken() },
    body: formData,
  })
  .then(response => {
    if (response.ok) {
      addLog('NIFTI bestand succesvol geüpload.');
      fetchAndVisualizeNifti();
    } else {
      addLog('Fout bij upload NIFTI.');
    }
  })
  .catch(error => {
    console.error('Upload fout:', error);
    addLog('Upload NIFTI mislukt.');
  });
});

// Viewer resetten
document.getElementById('reset-viewer-btn').addEventListener('click', () => {
  addLog('Resetten van viewer en media...');

  // Viewers legen
  ['viewer-3d', 'viewer-axial', 'viewer-coronal', 'viewer-sagittal'].forEach(id => {
    document.getElementById(id).innerHTML = '';
  });

  // Server-side media verwijderen
  fetch('/reset/', {
    method: 'POST',
    headers: { 'X-CSRFToken': getCSRFToken() },
  })
    .then(response => {
      if (response.ok) {
        addLog('Viewer geleegd, media verwijderd.');
      } else {
        addLog('Fout bij resetten van media.');
      }
    })
    .catch(error => {
      console.error('Reset fout:', error);
      addLog('Fout bij communicatie met server.');
    });
});
