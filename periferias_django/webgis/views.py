from django.shortcuts import render


def webgis(request):
    return render(request, 'webgis/webgis.html')
