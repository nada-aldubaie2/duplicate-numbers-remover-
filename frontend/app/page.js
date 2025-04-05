"use client";
import { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import Footer from "../app/components/footer";
import Btn from "../app/components/btn";

export default function Home() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [fileId, setFileId] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState([]);
  const [cleanedFileUrl, setCleanedFileUrl] = useState(null);
  const [originalFileUrl, setOriginalFileUrl] = useState(null);
  const [noDuplicatesMessage, setNoDuplicatesMessage] = useState("");
  const [stats, setStats] = useState({
    totalBefore: 0,
    totalAfter: 0,
    duplicatesCount: 0,
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: ".vcf",
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setNoDuplicatesMessage("");
    },
  });

  const processFile = async () => {
    if (!file) return;

    setProcessing(true);
    setNoDuplicatesMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/process-vcf/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFileId(response.data.id);
      setDuplicates(response.data.duplicates);
      setOriginalFileUrl(response.data.original_file);
      setSelectedDuplicates(response.data.duplicates);
        
      
      if (response.data.duplicates.length === 0)
        setNoDuplicatesMessage("لا توجد لديك أرقام مكررة 🌝✔️");
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      setProcessing(false);
    }
  };

  const cleanFile = async () => {
    if (!fileId || selectedDuplicates.length === 0) return;

    setProcessing(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/clean-vcf/",
        {
          id: fileId,
          duplicates: selectedDuplicates,
        }
      );

      setCleanedFileUrl(response.data.cleaned_file);
      setStats({
        ...stats,
        totalAfter: response.data.stats.total_after
      });

    } catch (error) {
      console.error("Error cleaning file:", error);
    } finally {
      setProcessing(false);
    }
  };

  const toggleDuplicate = (number) => {
    setSelectedDuplicates((prev) =>
      prev.includes(number)
        ? prev.filter((n) => n !== number)
        : [...prev, number]
    );
  };

  const selectAllDuplicates = () => {
    setSelectedDuplicates(duplicates);
  };

  const deselectAllDuplicates = () => {
    setSelectedDuplicates([]);
  };

  const downloadFile = async () => {
    try {
      window.location.href = `http://localhost:8000/api/download/${fileId}/`;
    } catch (error) {
      console.error("Download error:", error);
      alert("حدث خطأ أثناء التنزيل. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <>
      <div dir="rtl" className="min-h-screen flex flex-col">
        <main className="flex-grow max-w-2xl mx-auto p-5 font-sans text-center w-full">
          {/* <div  className="max-w-2xl mx-auto p-5 font-sans text-center"> */}
          <h1 className="text-3xl  text-cyan-600 mb-6">
            تنظيف ارقام الهاتف المكررة من ملف VCF
          </h1>

          <div
            {...getRootProps()}
            className="border border-gray-500 rounded-lg p-10 mb-6 cursor-pointer hover:bg-cyan-950 transition"
          >
            <input {...getInputProps()} />
            <p className="text-gray-300 text-xl">
              اسحب وأسقط ملف VCF هنا، أو انقر لتحديد الملف
            </p>
            {file && (
              <p className="mt-2 text-cyan-700">تم اختيار الملف: {file.name}</p>
            )}
          </div>

          {file && (
            <Btn
              title={processing ? "جاري المعالجة..." : "معالجة الملف"}
              onClick={processFile}
              disabled={processing}
            />
          )}

          {noDuplicatesMessage && (
            <div className="my-5 p-4 border border-gray-500 rounded-lg font-normal text-2xl text-cyan-600">
              <p>{noDuplicatesMessage}</p>
            </div>
          )}

          {duplicates.length > 0 && (
            <div className="mt-8 text-right" dir="rtl">
              <h6 className="text-gray-400">عدد الأرقام قبل التنظيف: <span className="font-bold">{stats.totalBefore}</span></h6>
              <h2 className="text-xl  text-cyan-500 mt-3">
                الأرقام المكررة ({duplicates.length})
              </h2>

              <ul className="max-h-80 overflow-y-auto border border-cyan-900 rounded-sm p-4 my-4 ">
                {duplicates.map((number, index) => (
                  <li
                    key={index}
                    className="py-2 border-b border-cyan-900 last:border-b-0"
                  >
                    <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDuplicates.includes(number)}
                        onChange={() => toggleDuplicate(number)}
                        className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500"
                      />
                      <span dir="ltr" className="text-white pr-2.5">
                        {number}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="my-4 space-x-3">
                <Btn title="تحديد الكل" onClick={selectAllDuplicates} />
                <Btn title="إلغاء التحديد" onClick={deselectAllDuplicates} />
              </div>
              <Btn
                title={processing ? "جاري التنظيف..." : "حذف المحدد"}
                onClick={cleanFile}
                disabled={processing || selectedDuplicates.length === 0}
              />
              </div>
          )}


          {cleanedFileUrl && duplicates.length > 0 && (
            
       <>
             <div className="my-6 text-center">
             <h6 className="text-gray-300">عدد الأرقام بعد التنظيف: <span className="font-bold text-cyan-400">{stats.totalAfter}</span></h6>
             <h6 className="text-gray-300">عدد الأرقام المحذوفة: <span className="font-bold">{stats.totalBefore - stats.totalAfter}</span></h6>
              </div>
               <div className="mt-8 p-4 border-2 border-dashed border-gray-500 rounded-lg">
                 <h2 className="text-xl font-semibold text-cyan-00 mb-3">
                   تم تنظيف الملف بنجاح
                 </h2>
                 <Btn title=" تنزيل الملف النظيف" onClick={downloadFile} />
               </div>
       </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
