from django.db import models
class VcfFile(models.Model):
    original_file = models.FileField(upload_to='vcfs/')
    cleaned_file = models.FileField(upload_to='cleaned_vcfs/', null=True, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    
    def __str__(self):
        return self.original_file.name