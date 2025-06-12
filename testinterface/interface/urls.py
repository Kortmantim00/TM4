from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('reset/', views.reset_viewer, name='reset_viewer'),
]