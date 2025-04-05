from django.contrib import admin
from django.urls import path
from vcf_api.views import ProcessVcfView, CleanVcfView, DownloadView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/process-vcf/', ProcessVcfView.as_view(), name='process-vcf'),
    path('api/clean-vcf/', CleanVcfView.as_view(), name='clean-vcf'),
    path('api/download/<int:file_id>/', DownloadView.as_view(), name='download-file')
] 
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)