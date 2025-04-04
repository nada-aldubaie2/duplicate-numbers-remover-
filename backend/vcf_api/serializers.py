from rest_framework import serializers
from .models import VcfFile

class VcfFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VcfFile
        fields = '__all__'