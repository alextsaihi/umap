from django.db import models
import orjson


class ORJSONDecodedField(models.JSONField):

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        try:
            return orjson.loads(value)
        except orjson.JSONDecodeError:
            return value


class Target(models.Model):
    name = models.CharField(max_length=100, db_index=True)


class Dataset(models.Model):
    name = models.CharField(max_length=120)


class Sample(models.Model):
    plate_barcode = models.CharField(max_length=100, db_index=True)
    well_id = models.CharField(max_length=100)
    dataset = models.ForeignKey("Dataset", on_delete=models.CASCADE)
    metadata = ORJSONDecodedField(null=True)


class SampleSignal(models.Model):
    target = models.ForeignKey("Target", on_delete=models.CASCADE)
    sample = models.ForeignKey("Sample", related_name='signals', on_delete=models.CASCADE)
    signal = models.FloatField()


class UmapPlotPoint(models.Model):
    x_coor = models.FloatField(null=False)
    y_coor = models.FloatField(null=False)
    sample = models.ForeignKey("Sample", on_delete=models.CASCADE)
