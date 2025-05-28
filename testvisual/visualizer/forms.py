from django import forms
from .models import NiftiFile

class NiftiFileForm(forms.ModelForm):
    class Meta:
        model = NiftiFile
        fields = ['title', 'file']