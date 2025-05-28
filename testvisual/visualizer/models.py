from django.db import models

# Create your models here.

from django.db import models

class NiftiFile(models.Model):
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='nifti/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title