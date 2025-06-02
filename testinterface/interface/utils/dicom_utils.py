import pydicom
import numpy as np
import os
import json

def dicom_to_voxel(dicom_folder):
    slices = []

    for filename in sorted(os.listdir(dicom_folder)):
        path = os.path.join(dicom_folder, filename)

        try:
            ds = pydicom.dcmread(path)
            if hasattr(ds, 'pixel_array'):
                slices.append(ds.pixel_array)
        except Exception as e:
            print(f"Skipping non-DICOM file or invalid file: {filename} ({e})")

    if not slices:
        raise ValueError("No valid DICOM slices found in folder.")

    volume = np.stack(slices)
    return volume.tolist()

def save_volume_as_json(volume, output_path):
    with open(output_path, 'w') as f:
        json.dump({'voxels': volume}, f)