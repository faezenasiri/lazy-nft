from django.shortcuts import render
from rest_framework import viewsets
from .serializers import NftSerializer, NftSerializer1155
from .models import Nft, Nft1155

# Create your views here.


class TodoView(viewsets.ModelViewSet):
    serializer_class = NftSerializer
    queryset = Nft.objects.all()


class notTodoView(viewsets.ModelViewSet):
    serializer_class = NftSerializer1155
    queryset = Nft1155.objects.all()
