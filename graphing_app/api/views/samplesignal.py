from api.models import SampleSignal
from api.serializers import SampleSignalSerializer
from rest_framework import viewsets


class SampleSignalViewSet(viewsets.ModelViewSet):
    queryset = SampleSignal.objects.all()
    serializer_class = SampleSignalSerializer
