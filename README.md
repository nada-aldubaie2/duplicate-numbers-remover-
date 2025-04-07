# 📱 VCF Duplicate Contacts Cleaner

A tool to detect and remove duplicate phone numbers from VCF (vCard) contact files while preserving all other contact information.

## <a href='https://vcf-cleaner.vercel.app/'>🔗 Tool trial link</a>
![vcf](https://github.com/user-attachments/assets/2b010844-aa88-46d6-a808-f45876255119)

## ✨ Features

- Automatic detection of duplicate phone numbers
- Selective removal of duplicates
- Full Arabic language support (UTF-8 encoding)
- Detailed before/after cleaning statistics
- Export cleaned contacts to new VCF file
- Responsive modern UI

## 🛠 Tech Stack

### Backend
![Python](https://img.shields.io/badge/Python-3.12.4-blue?logo=python)
![Django](https://img.shields.io/badge/Django-5.0.3-green?logo=django)
![DRF](https://img.shields.io/badge/DRF-3.15-red)

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-cyan?logo=tailwind-css)

## 🚀 Getting Started

### Prerequisites
- Python 3.12.4
- Node.js v22.14.0
- npm 11.2.0
- Sqlite3 (recommended to use PostgreSQL)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nada-aldubaie2/duplicate-numbers-remover-.git
cd vcf-cleaner
```

2. Set up backend:
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

3. Set up frontend:
```bash
cd frontend
npm install
npm run dev
```

## 📂 Project Structure

```
vcf-cleaner/
├── backend/          # Django REST API
│   ├── vcf_api/      # VCF processing logic
|   ├── media/
|   ├── backend/       #Core 
│   ├── manage.py
│   └── settings.py
├── frontend/         # Next.js application
│   ├── components/
│   ├── pages/
│   └── public/
├── README.md
└── requirements.txt
```

## 🖥 Usage

1. Upload your VCF file
2. System will automatically detect duplicate numbers
3. Select which duplicates to remove (or "Select All")
4. Click "Clean Selected"
5. Download the cleaned VCF file

## 📊 Statistics Provided

- Total contacts before cleaning
- Number of duplicate phone numbers found 
- Contacts count after cleaning
- Number of duplicates removed

<!--## 🧪 Testing

Run backend tests:
```bash
python manage.py test
```

Run frontend tests:
```bash
cd frontend
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

-->
## 📬 Contact

For questions or support, please contact:

- <a href="https://www.linkedin.com/in/nada-aldubaie-3a3a96238" target="_blank">
  <img src="https://img.icons8.com/color/48/000000/linkedin.png" width="20" style="vertical-align:middle"/> Nada Aldubaie</a>
- <img src="https://img.icons8.com/color/48/000000/github.png" width="20" style="vertical-align:middle"/> Project Link: [https://github.com/nada-aldubaie2/duplicate-numbers-remover-](https://github.com/nada-aldubaie2/duplicate-numbers-remover-)

## 🙏 Acknowledgments

- Hat tip to anyone whose code was used
