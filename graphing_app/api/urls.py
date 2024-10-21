from django.urls import path, include
from rest_framework import routers
from api.views.dataset import DatasetViewSet
from api.views.umap import UmapPlotPointViewSet
from api.views.samplesignal import SampleSignalViewSet
from api.views.target import TargetViewSet
from api.views.sample import SampleViewSet

router = routers.DefaultRouter()
router.register(r"dataset", DatasetViewSet, basename="dataset")
router.register(r"umapplotpoint", UmapPlotPointViewSet, basename="umapplotpoint")
router.register(r"sample", SampleViewSet, basename="sample")
router.register(r"samplesignal", SampleSignalViewSet, basename="samplesignal")
router.register(r"target", TargetViewSet, basename="target")

urlpatterns = [path("api/", include(router.urls))]
