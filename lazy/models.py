from django.db import models

# Create your models here.


class Nft(models.Model):
    tokenId = models.IntegerField()
    name = models.CharField(max_length=120)
    sig = models.TextField(default='a')
    url = models.TextField(default='a')
    sold = models.BooleanField(default=True)

    def _str_(self):
        return self.name
