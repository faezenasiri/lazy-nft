from rest_framework import serializers
from .models import Nft


class NftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nft
        fields = ('id', 'tokenId', 'name', 'sig', 'url',
                  'sold', 'amount', 'erc1155')
