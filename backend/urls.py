from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from lazy import views

router = routers.DefaultRouter()
router.register(r'Nfts', views.TodoView, 'Nft')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('nfts/<int:tokenId>/', views.TodoView.as_view),
]
