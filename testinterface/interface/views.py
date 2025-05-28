from django.shortcuts import render

# Create your views here.

def home(request):
    """
    Render the home page of the test interface.
    """
    return render(request, "interface/home.html", {})
