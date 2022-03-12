from django.shortcuts import render
from rest_framework import viewsets
from .serializers import NftSerializer
from .models import Nft

# Create your views here.


class TodoView(viewsets.ModelViewSet):
    serializer_class = NftSerializer
    queryset = Nft.objects.all()
