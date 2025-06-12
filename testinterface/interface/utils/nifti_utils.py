import nibabel as nib
import numpy as np
import json
import os


def convert_nifti_to_json(nifti_path, output_path='media/volume_nifti.json'):
    #Laad NIfTI
    nifti_img = nib.load(nifti_path)
    data = nifti_img.get_fdata()
    spacing = nifti_img.header.get_zooms()[:3]  # (x, y, z)

    #Clipping en cast naar 8-bit
    data_clipped = np.clip(data, 0, 255).astype(np.uint8)
    voxels_list = data_clipped.tolist()

    output_data = {
        'voxels': voxels_list,
        'spacing': spacing
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(output_data, f)

    return output_path
