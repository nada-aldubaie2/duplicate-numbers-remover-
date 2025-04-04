'use client'
import { useState } from 'react'
import axios from 'axios'
import { useDropzone } from 'react-dropzone'

export default function Home() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [fileId, setFileId] = useState(null)
  const [duplicates, setDuplicates] = useState([])
  const [selectedDuplicates, setSelectedDuplicates] = useState([])
  const [cleanedFileUrl, setCleanedFileUrl] = useState(null)
  const [originalFileUrl, setOriginalFileUrl] = useState(null)
  const [noDuplicatesMessage, setNoDuplicatesMessage] = useState('')

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.vcf',
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0])
      setNoDuplicatesMessage('')
    },
  })

  const processFile = async () => {
    if (!file) return
    
    setProcessing(true)
    setNoDuplicatesMessage('')
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await axios.post('http://localhost:8000/api/process-vcf/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      setFileId(response.data.id)
      setDuplicates(response.data.duplicates)
      setOriginalFileUrl(response.data.original_file)
      setSelectedDuplicates(response.data.duplicates)

      if (response.data.duplicates.length === 0)
        setNoDuplicatesMessage('لا توجد لديك أرقام مكررة 🌝')
    } catch (error) {
      console.error('Error processing file:', error)
    } finally {
      setProcessing(false)
    }
  }

  const cleanFile = async () => {
    if (!fileId || selectedDuplicates.length === 0) return
    
    setProcessing(true)
    
    try {
      const response = await axios.post('http://localhost:8000/api/clean-vcf/', {
        id: fileId,
        duplicates: selectedDuplicates,
      })
      
      setCleanedFileUrl(response.data.cleaned_file)
    } catch (error) {
      console.error('Error cleaning file:', error)
    } finally {
      setProcessing(false)
    }
  }

  const toggleDuplicate = (number) => {
    setSelectedDuplicates(prev => 
      prev.includes(number) 
        ? prev.filter(n => n !== number) 
        : [...prev, number]
    )
  }

  const selectAllDuplicates = () => {
    setSelectedDuplicates(duplicates)
  }

  const deselectAllDuplicates = () => {
    setSelectedDuplicates([])
  }

  const downloadFile = async () => {
    try {
      window.location.href = `http://localhost:8000/api/download/${fileId}/`
    } catch (error) {
      console.error('Download error:', error)
      alert('حدث خطأ أثناء التنزيل. يرجى المحاولة مرة أخرى.')
    }
  }

  return (
   <>
     <div dir='rtl' className="max-w-2xl mx-auto p-5 font-sans text-center">
       <h1 className="text-3xl  text-cyan-600 mb-6">تنظيف ارقام الهاتف المكررة من ملف VCF</h1>
       
       <div {...getRootProps()} className="border border-gray-500 rounded-lg p-10 mb-6 cursor-pointer hover:bg-cyan-950 transition">
         <input {...getInputProps()} />
         <p className="text-gray-300 text-xl">اسحب وأسقط ملف VCF هنا، أو انقر لتحديد الملف</p>
         {file && <p className="mt-2 text-cyan-700">تم اختيار الملف: {file.name}</p>}
       </div>
       
       {file && (
         <button 
           onClick={processFile} 
           disabled={processing}
           className={`px-6 py-2 rounded-lg ${processing ? 'bg-cyan-300' : 'bg-cyan-600'} text-white font-medium hover:bg-cyan-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed`}
         >
           {processing ? 'جاري المعالجة...' : 'معالجة الملف'}
         </button>
       )}
    
       {noDuplicatesMessage && (
         <div className="my-5 p-4 border border-gray-500 rounded-lg font-normal text-2xl text-cyan-600">
           <p>{noDuplicatesMessage}</p>
         </div>
       )}
    
       {duplicates.length > 0 && (
         <div className="mt-8 text-right" dir="rtl">
           <h2 className="text-xl  text-cyan-500">الأرقام المكررة ({duplicates.length})</h2>
           
          
           
           <ul className="max-h-80 overflow-y-auto border border-cyan-900 rounded-sm p-4 my-4 ">
             {duplicates.map((number, index) => (
               <li key={index} className="py-2 border-b border-cyan-900 last:border-b-0">
                 <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                   <input
                     type="checkbox"
                     checked={selectedDuplicates.includes(number)}
                     onChange={() => toggleDuplicate(number)}
                     className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500"
                   />
                   <span dir='ltr' className="text-white pr-2.5">{number}</span>
                 </label>
               </li>
             ))}
           </ul>
           <div className="my-4 space-x-3">
             <button 
               onClick={selectAllDuplicates}
               className="px-4 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition"
             >
               تحديد الكل
             </button>
             <button 
               onClick={deselectAllDuplicates}
               className="px-4 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition"
             >
               إلغاء التحديد
             </button>
           </div>
           <button 
             onClick={cleanFile} 
             disabled={processing || selectedDuplicates.length === 0}
             className={`mt-4 px-6 py-2 rounded-lg ${processing ? 'bg-cyan-300' : 'bg-cyan-600'} text-white font-medium hover:bg-cyan-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed`}
           >
             {processing ? 'جاري التنظيف...' : 'حذف المحدد'}
           </button>
         </div>
       )}
       
       {cleanedFileUrl && (
         <div className="mt-8 p-4 bg-cyan-50 rounded-lg">
           <h2 className="text-xl font-semibold text-cyan-700 mb-3">تم تنظيف الملف بنجاح</h2>
           <button 
             onClick={downloadFile}
             className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
           >
             تنزيل الملف النظيف
           </button>
         </div>
       )}
     </div>
     <div className='mx-auto text-center py-7'>
       <p className='text-sm '>تم تطويره بواسطة @ <a className='text-cyan-600 hover:text-cyan-200  text-lg' href='https://www.linkedin.com/in/nada-aldubaie%F0%9F%AA%84-3a3a96238?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'>ندى الدبعي</a></p>
     </div>
     
   </>
  )
}