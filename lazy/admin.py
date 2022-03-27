# Register your models here.
from django.contrib import admin
from .models import Nft


class NftAdmin(admin.ModelAdmin):

    list_display = ('tokenId', 'name', 'sig', 'url', 'sold', 'amount')

# Register your models here.


admin.site.register(Nft, NftAdmin)
