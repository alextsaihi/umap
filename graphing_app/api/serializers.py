from rest_framework import serializers
from api.models import Target, Dataset, Sample, SampleSignal, UmapPlotPoint


class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ["id", "name"]

class SampleSerializer(serializers.ModelSerializer):
    dataset = DatasetSerializer()
    class Meta:
        model = Sample
        fields = ['id', 'metadata', 'dataset', 'plate_barcode', 'well_id']

class UmapPlotPointSerializer(serializers.ModelSerializer):
    sample = SampleSerializer()
    class Meta:
        model = UmapPlotPoint
        fields = ['id', 'x_coor', 'y_coor', 'sample']

class TargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Target
        fields = ['id','name']

class SampleSignalSerializer(serializers.ModelSerializer):
    sample = SampleSerializer()
    target = TargetSerializer()
    class Meta:
        model = SampleSignal
        fields = ['id', 'signal', 'sample', 'target']
