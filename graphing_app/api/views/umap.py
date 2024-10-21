from api.models import UmapPlotPoint
from api.serializers import UmapPlotPointSerializer
from rest_framework import viewsets


class UmapPlotPointViewSet(viewsets.ModelViewSet):
    queryset = UmapPlotPoint.objects.all()
    serializer_class = UmapPlotPointSerializer
