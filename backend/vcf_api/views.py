import re
import tempfile
import os
from django.http import JsonResponse, FileResponse, HttpResponse
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
            result = self.find_duplicates(vcf_file.original_file.path)
            
            return Response({
                'id': vcf_file.id,
                'total_numbers': result['total_numbers'],
                'unique_numbers': result['unique_numbers'],
                'duplicates': result['duplicates'],
                'original_file': vcf_file.original_file.url
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def find_duplicates(self, file_path):
        phone_numbers = {}
        duplicates = []
        total_numbers = 0
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        vcards = content.split('BEGIN:VCARD')
        for vcard in vcards:
            if not vcard.strip():
                continue
                
            matches = re.findall(r'TEL[^:]*:([^\r\n]+)', vcard, re.IGNORECASE)
            for num in matches:
                total_numbers += 1
                num = num.strip()
                if num in phone_numbers:
                    duplicates.append(num)
                    phone_numbers[num] += 1
                else:
                    phone_numbers[num] = 1
        
        return {
            'total_numbers': total_numbers,
            'duplicates': list(set(duplicates)),
            'unique_numbers': len(phone_numbers)
        }


class CleanVcfView(APIView):
    def post(self, request, format=None):
        try:
            file_id = request.data.get('id')
            duplicates_to_remove = request.data.get('duplicates', [])
            vcf_file = VcfFile.objects.get(id=file_id)
            
            result = self.remove_duplicates(
                vcf_file.original_file.path, 
                duplicates_to_remove
            )
            
            with open(result['file_path'], 'rb') as f:
                vcf_file.cleaned_file.save(
                    os.path.basename(result['file_path']), 
                    f
                )
            
            return Response({
                'cleaned_file': vcf_file.cleaned_file.url,
                'stats': {
                    'total_before': result['total_before'],
                    'total_after': result['total_after'],
                    'removed_count': result['total_before'] - result['total_after']
                }
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def remove_duplicates(self, file_path, duplicates_to_remove):
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.vcf', mode='w', encoding='utf-8')
        duplicates_set = set(duplicates_to_remove)
        total_before = 0
        total_after = 0
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        vcards = content.split('BEGIN:VCARD')
        for vcard in vcards:
            if not vcard.strip():
                continue
                
            lines = vcard.split('\n')
            new_lines = []
            skip_card = False
            
            for line in lines:
                if line.startswith('TEL;') or line.startswith('TEL:'):
                    total_before += 1
                    tel = line.split(':')[1].strip()
                    if tel in duplicates_set:
                        skip_card = True
                    else:
                        new_lines.append(line)
                        total_after += 1
                else:
                    new_lines.append(line)
            
            if not skip_card:
                temp_file.write('BEGIN:VCARD\n' + '\n'.join(new_lines))
        
        temp_file.close()
        
        return {
            'file_path': temp_file.name,
            'total_before': total_before,
            'total_after': total_after
        }


class DownloadView(APIView):
    def get(self, request, file_id):
        try:
            vcf_file = VcfFile.objects.get(id=file_id)
            
            if not vcf_file.cleaned_file:
                return HttpResponse("الملف غير موجود", status=404)
                
            file_path = vcf_file.cleaned_file.path
            
            if not os.path.exists(file_path):
                return HttpResponse("الملف غير موجود على الخادم", status=404)
            
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Type'] = 'text/vcard; charset=utf-8'
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response
            
        except VcfFile.DoesNotExist:
            return HttpResponse("السجل غير موجود", status=404)