import re
import tempfile
import os
from django.http import JsonResponse, FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .models import VcfFile
from .serializers import VcfFileSerializer
from wsgiref.util import FileWrapper


class ProcessVcfView(APIView):
    parser_classes = (MultiPartParser,)

    def post(self, request, format=None):
        try:
            uploaded_file = request.FILES['file']
            vcf_file = VcfFile.objects.create(original_file=uploaded_file)
            duplicates = self.find_duplicates(vcf_file.original_file.path)
            
            return Response({
                'id': vcf_file.id,
                'duplicates': duplicates,
                'original_file': vcf_file.original_file.url
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def find_duplicates(self, file_path):
        phone_numbers = {}
        duplicates = []
        tel_pattern = re.compile(r'TEL[^:]*:([^\r\n]+)', re.IGNORECASE)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # تقسيم المحتوى إلى بطاقات فردية
        vcards = content.split('BEGIN:VCARD')
        for vcard in vcards:
            if not vcard.strip():
                continue
                
            # البحث عن أرقام الهاتف في البطاقة
            matches = tel_pattern.findall(vcard)
            for num in matches:
                num = num.strip()
                if num in phone_numbers:
                    duplicates.append(num)
                    phone_numbers[num] += 1
                else:
                    phone_numbers[num] = 1
        
        return list(set(duplicates))

class CleanVcfView(APIView):
    def post(self, request, format=None):
        try:
            file_id = request.data.get('id')
            duplicates_to_remove = request.data.get('duplicates', [])
            vcf_file = VcfFile.objects.get(id=file_id)
            
            cleaned_path = self.remove_duplicates(
                vcf_file.original_file.path, 
                duplicates_to_remove
            )
            
            with open(cleaned_path, 'rb') as f:
                vcf_file.cleaned_file.save(
                    os.path.basename(cleaned_path), 
                    f
                )
            return Response({
                'cleaned_file': vcf_file.cleaned_file.url
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def remove_duplicates(self, file_path, duplicates_to_remove):
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.vcf', mode='w', encoding='utf-8')
        tel_pattern = re.compile(r'(TEL[^:]*:)([^\r\n]+)', re.IGNORECASE)
        duplicates_set = set(duplicates_to_remove)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # معالجة كل بطاقة على حدة
        vcards = content.split('BEGIN:VCARD')
        for vcard in vcards:
            if not vcard.strip():
                continue
                
            # تصفية أرقام الهاتف المكررة
            modified_vcard = tel_pattern.sub(
                lambda m: m.group(0) if m.group(2).strip() not in duplicates_set else '',
                vcard
            )
            
            # كتابة البطاقة المعدلة إذا كانت تحتوي على أرقام
            if 'TEL' in modified_vcard:
                temp_file.write('BEGIN:VCARD' + modified_vcard)
        
        temp_file.close()
        return temp_file.name
    

class DownloadView(APIView):
    def get(self, request, file_id):
        try:
            vcf_file = VcfFile.objects.get(id=file_id)
            
            if not vcf_file.cleaned_file:
                return HttpResponse("الملف غير موجود", status=404)
                
            file_path = vcf_file.cleaned_file.path
            
            if not os.path.exists(file_path):
                return HttpResponse("الملف غير موجود على الخادم", status=404)
            
            # الطريقة الأمثل للتنزيل
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Type'] = 'text/vcard'
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response
            
        except VcfFile.DoesNotExist:
            return HttpResponse("السجل غير موجود", status=404)