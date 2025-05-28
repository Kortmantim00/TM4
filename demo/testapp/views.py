from django.shortcuts import render, HttpResponse

# Create your views here.
def home(request):
    return render(request, "home.html")

# def about(request):
#     return render(request, "about.html", {"message": "This is the about page of the test app."})

# def contact(request):
#     return render(request, "contact.html", {"message": "This is the contact page of the test app."})        

# def error_404_view(request, exception):
#     return render(request, "404.html", {"message": "Page not found."}, status=404)      

# def error_500_view(request):
#     return render(request, "500.html", {"message": "Internal server error."}, status=500)

# def error_403_view(request, exception):
#     return render(request, "403.html", {"message": "Forbidden access."}, status=403)

# def error_400_view(request, exception):
#     return render(request, "400.html", {"message": "Bad request."}, status=400)
