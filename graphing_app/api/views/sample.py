from api.models import Sample
from api.serializers import SampleSerializer
from rest_framework import viewsets


class SampleViewSet(viewsets.ModelViewSet):
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer
