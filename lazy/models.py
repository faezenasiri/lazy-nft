from django.db import models

# Create your models here.


class Nft(models.Model):
    tokenId = models.IntegerField()
    name = models.CharField(max_length=120)
    sig = models.TextField(default='a')
    url = models.TextField(default='a')
    sold = models.BooleanField(default=True)
    amount = models.IntegerField(default=1)
    erc1155 = models.BooleanField(default=False)

    def _str_(self):
        return self.name
