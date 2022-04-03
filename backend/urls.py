from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from lazy import views

router = routers.DefaultRouter()
router.register(r'Nfts', views.TodoView, 'Nft')
router.register(r'Nfts1155', views.notTodoView, 'Nft1155')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('nfts/<int:tokenId>/', views.TodoView.as_view),
    path('nfts/<int:tokenId>/', views.notTodoView.as_view),

]
