from api.models import Target
from api.serializers import TargetSerializer
from rest_framework import viewsets


class TargetViewSet(viewsets.ModelViewSet):
    queryset = Target.objects.all()
    serializer_class = TargetSerializer
