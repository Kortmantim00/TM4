from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('upload/', views.upload_file, name='upload_file'),
    path('files/', views.uploaded_files, name='uploaded_files'),
    #path('viewer/', views.view_file, name='view_file'),
    path('viewer/', views.viewer, name='viewer'), 
]