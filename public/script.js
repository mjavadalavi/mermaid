document.addEventListener('DOMContentLoaded', function() {
    const mermaidInput = document.getElementById('mermaid-code');
    const renderForm = document.getElementById('render-form');
    const resultContainer = document.getElementById('result-container');
    const loadingIndicator = document.querySelector('.loading');
    const errorMessage = document.getElementById('error-message');
    const exampleButtons = document.querySelectorAll('.example-button');
    
    // Handle form submission
    if (renderForm && mermaidInput) {
        renderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            renderDiagram();
        });
        
        // Also render on Ctrl+Enter
        mermaidInput.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                renderDiagram();
            }
        });
    }
    
    // Handle example buttons
    if (exampleButtons.length > 0) {
        exampleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const exampleType = this.getAttribute('data-example');
                setExampleCode(exampleType);
            });
        });
    }
    
    function setExampleCode(type) {
        let code = '';
        
        switch(type) {
            case 'flowchart':
                code = `graph TD
    A[شروع] --> B{تصمیم‌گیری}
    B -->|بله| C[اقدام مثبت]
    B -->|خیر| D[اقدام منفی]
    C --> E[نتیجه]
    D --> E`;
                break;
            case 'sequence':
                code = `sequenceDiagram
    participant کاربر
    participant سیستم
    participant پایگاه داده
    
    کاربر->>سیستم: درخواست ورود
    سیستم->>پایگاه داده: بررسی اعتبار
    پایگاه داده-->>سیستم: تأیید اعتبار
    سیستم-->>کاربر: ورود موفق`;
                break;
            case 'class':
                code = `classDiagram
    class حیوان {
        +نام: رشته
        +سن: عدد
        +صدا()
    }
    class گربه {
        +میو()
    }
    class سگ {
        +پارس()
    }
    حیوان <|-- گربه
    حیوان <|-- سگ`;
                break;
            case 'er':
                code = `erDiagram
    Customer ||--|{ Order : "ثبت"
    Order ||--|{ Product : "شامل"
    
    Customer {
        string Name "نام"
        string Email "ایمیل"
    }
    
    Order {
        int ID "شماره"
        date Date "تاریخ"
    }
    
    Product {
        string Name "نام"
        float Price "قیمت"
    }
`;
                break;
            case 'gantt':
                code = `gantt
    title برنامه پروژه
    dateFormat  YYYY-MM-DD
    section فاز اول
    تحلیل نیازها      :a1, 2023-01-01, 7d
    طراحی             :a2, after a1, 10d
    section فاز دوم
    پیاده‌سازی         :a3, after a2, 15d
    تست               :a4, after a3, 5d`;
                break;
            case 'persian':
                code = `flowchart TB
    A([\"توقف یک سال پس از مرگونیت\"]) --> |\"شخص حقیقی\"| B[\"امکان صدور حکم\"]
    A --> |\"اشخاص حقوقی\"| C[\"بررسی امکان انحلال\"]
    C --> D[\"پس از یک سال از فوت: امکان بررسی مجدد\"]
    
    E([\"دادگاه کیفری\"]) --> |\"ورشکستگی به تقلب\"| F[\"حکم صادر شده\"]
    F --> G[\"مدنی هم تبعیت کند؟: نیاز به بررسی مجدد\"]
    
    H([\"حکم ورشکستگی\"]) --> |\"پرداخت هزینه دادرسی\"| I[\"عدم توانایی\"]
    I --> |\"نیاز به تجدیدنظرخواهی\"| J[\"آیا تاجر حق دادخواست اعسار دارد؟\"]
    J --> |\"ماده 512 آیین دادرسی مدنی\"| K[\"تاجر باید دادخواست ورشکستگی دهد\"]
    
    L([\"ورشکستگی شخص حقوقی\"]) --> |\"شامل شرکت‌های تجاری\"| M[\"قابل پذیرش\"]
    L --> |\"سایر اشخاص حقوقی\"| N[\"اعسار و نه ورشکستگی\"]
    
    O([\"نظریه حقوقی و قضاییه\"]) --> |\"سال 97\"| P[\"اعسار شامل اشخاص حقوقی خصوصی و عمومی است\"]
    
    Q([\"شرکت‌های تجاری\"]) --> |\"مشمول ماده 23 قانون تجارت\"| R[\"حکم ورشکستگی از زمان احراز شخصیت حقوقی\"]
    
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef main fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef secondary fill:#fff8e1,stroke:#ff6f00,stroke-width:1px;
    
    class A,E,H,L,O,Q main;
    class B,C,F,I,J,M,N,P,R secondary;`;
                break;
        }
        
        if (code && mermaidInput) {
            mermaidInput.value = code;
        }
    }
    
    function renderDiagram() {
        if (!mermaidInput.value.trim()) {
            showError('لطفاً کد Mermaid را وارد کنید.');
            return;
        }
        
        // Show loading indicator
        if (loadingIndicator) loadingIndicator.style.display = 'flex';
        if (errorMessage) errorMessage.style.display = 'none';
        if (resultContainer) resultContainer.innerHTML = '';
        
        // Collect options from form
        const formData = new FormData(renderForm);
        const options = {
            theme: formData.get('theme') || 'default',
            width: parseInt(formData.get('width')) || 2000,
            height: parseInt(formData.get('height')) || 1400,
            scale: parseFloat(formData.get('scale')) || 3,
            backgroundColor: formData.get('backgroundColor') || '#ffffff',
            fontFamily: formData.get('fontFamily') || 'B Yekan,San Francisco, Vazirmatn, Tahoma, sans-serif',
            fontSize: formData.get('fontSize') || '16px',
            roughStyle: formData.get('roughStyle') === 'on',
            curveTension: parseFloat(formData.get('curveTension')) || 0
        };
        
        // Send request to server
        fetch('/render', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: mermaidInput.value,
                options: options
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'خطا در رندر نمودار');
                });
            }
            return response.blob();
        })
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob);
            
            // Create image element
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Mermaid Diagram';
            img.className = 'result-image';
            
            // Create download button
            const downloadBtn = document.createElement('a');
            downloadBtn.href = imageUrl;
            downloadBtn.download = 'mermaid-diagram.png';
            downloadBtn.className = 'download-button';
            downloadBtn.textContent = 'دانلود تصویر';
            
            const downloadline = document.createElement('br');
            // Add to result container
            if (resultContainer) {
                resultContainer.innerHTML = '';
                resultContainer.appendChild(img);
                resultContainer.appendChild(downloadline);
                resultContainer.appendChild(downloadBtn);
            }
        })
        .catch(error => {
            showError(error.message);
        })
        .finally(() => {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        });
    }
    
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
    
    // Initialize with example if input is empty
    if (mermaidInput && mermaidInput.value.trim() === '') {
        setExampleCode('persian');
    }
}); 