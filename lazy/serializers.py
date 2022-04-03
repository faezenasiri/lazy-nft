from rest_framework import serializers
from .models import Nft, Nft1155


class NftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nft
        fields = ('id', 'tokenId', 'name', 'sig', 'url',
                  'sold', 'amount', 'erc1155', 'royal')


class NftSerializer1155(serializers.ModelSerializer):
    class Meta:
        model = Nft1155
        fields = ('id', 'tokenId', 'name', 'url',
                  'sold', 'amount', 'amountLeft', 'royal')
