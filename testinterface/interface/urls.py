from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path('upload-dicom/', views.upload_dicom, name='upload_dicom'),
]