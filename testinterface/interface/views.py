from django.shortcuts import render

# Create your views here.

import os
import pydicom
import numpy as np
import json
from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import default_storage
import os

from .utils.dicom_utils import dicom_to_voxel, save_volume_as_json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import tempfile

def home(request):
    if request.method == 'POST' and request.FILES.get('dicom_file'):
        uploaded_file = request.FILES['dicom_file']
        dicom_path = default_storage.save('dicoms/' + uploaded_file.name, uploaded_file)
        full_dicom_path = os.path.join(settings.MEDIA_ROOT, dicom_path)

        # Als het om meerdere bestanden gaat: pas hier aan
        voxel = dicom_to_voxel(os.path.dirname(full_dicom_path))
        json_path = os.path.join(settings.MEDIA_ROOT, 'volume.json')
        save_volume_as_json(voxel, json_path)

    return render(request, 'interface/home.html')

def upload_dicom(request):
    if request.method == 'POST':
        files = request.FILES.getlist('dicom_files')
        with tempfile.TemporaryDirectory() as tmpdirname:
            for file in files:
                filepath = os.path.join(tmpdirname, file.name)
                with open(filepath, 'wb+') as dest:
                    for chunk in file.chunks():
                        dest.write(chunk)

            try:
                volume = dicom_to_voxel(tmpdirname)
                return JsonResponse({'voxels': volume})
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)