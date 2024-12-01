// متغيرات عامة للتحكم في البيانات
let treatmentsCount = 3;
let replicationsCount = 3;

// دالة إنشاء الجدول
function createTable() {
    const treatments = parseInt(document.getElementById('treatments').value);
    const replications = parseInt(document.getElementById('replications').value);
    
    if (isNaN(treatments) || isNaN(replications) || treatments < 2 || replications < 2) {
        alert('الرجاء إدخال قيم صحيحة (2 أو أكثر) لعدد المعاملات والمكررات');
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    
    // إنشاء صف العناوين
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>المعاملات</th>' + 
        Array.from({length: replications}, (_, i) => `<th>R${i + 1}</th>`).join('');
    table.appendChild(headerRow);
    
    // إنشاء صفوف البيانات
    for (let i = 0; i < treatments; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>T${i + 1}</td>` + 
            Array.from({length: replications}, (_, j) => 
                `<td><input type="number" step="0.01" data-treatment="${i}" data-replication="${j}" required></td>`
            ).join('');
        table.appendChild(row);
    }

    // إضافة الجدول للصفحة
    const tableContainer = document.getElementById('dataTable');
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);

    // إظهار زر حساب النتائج
    document.querySelector('.calculate-btn').style.display = 'block';
}

// التحقق من صحة المدخلات
function validateInput(event) {
    const input = event.target;
    const value = input.value;
    
    if (value === '' || isNaN(value)) {
        input.classList.add('invalid');
    } else {
        input.classList.remove('invalid');
    }
}

// دالة جمع البيانات من الجدول
function collectData() {
    const treatments = parseInt(document.getElementById('treatments').value);
    const replications = parseInt(document.getElementById('replications').value);
    const data = [];
    
    for (let i = 0; i < treatments; i++) {
        data[i] = [];
        for (let j = 0; j < replications; j++) {
            const input = document.querySelector(`input[data-treatment="${i}"][data-replication="${j}"]`);
            const value = parseFloat(input.value);
            data[i][j] = isNaN(value) ? 0 : value;
        }
    }
    
    return data;
}

// دالة حساب المتوسط
function calculateMean(numbers) {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

// دالة حساب التباين
function calculateVariance(numbers, mean) {
    return numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (numbers.length - 1);
}

// دالة حساب النتائج
function calculateResults() {
    // التحقق من وجود نتائج سابقة وإزالتها
    const oldResults = document.getElementById('results');
    if (oldResults) {
        oldResults.remove();
    }

    const treatments = parseInt(document.getElementById('treatments').value);
    const replications = parseInt(document.getElementById('replications').value);
    
    // جمع البيانات من الجدول
    const data = [];
    let isValid = true;
    
    for (let i = 0; i < treatments; i++) {
        data[i] = [];
        for (let j = 0; j < replications; j++) {
            const input = document.querySelector(`input[data-treatment="${i}"][data-replication="${j}"]`);
            const value = parseFloat(input.value);
            
            if (isNaN(value)) {
                isValid = false;
                input.classList.add('invalid');
            } else {
                data[i][j] = value;
            }
        }
    }
    
    if (!isValid) {
        alert('الرجاء إدخال قيم صحيحة في جميع الخلايا');
        return;
    }

    // إنشاء عنصر النتائج
    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'results';
    
    // إضافة النتائج في نهاية الصفحة
    document.querySelector('.container').appendChild(resultsDiv);

    // حساب المجموع الكلي والمتوسط العام
    let grandTotal = 0;
    data.forEach(treatment => {
        treatment.forEach(value => {
            grandTotal += value;
        });
    });
    const n = treatments * replications;
    const grandMean = grandTotal / n;

    // 1. حساب معامل التصحيح (C.F.)
    const cf = Math.pow(grandTotal, 2) / n;

    // 2. حساب مجموع المربعات الكلي (Total SS)
    let sumOfSquares = 0;
    data.forEach(treatment => {
        treatment.forEach(value => {
            sumOfSquares += Math.pow(value, 2);
        });
    });
    const totalSS = sumOfSquares - cf;

    // 3. حساب مجموع مربعات المعاملات (Treatment SS)
    let treatmentSums = [];
    let treatmentSS = 0;
    data.forEach(treatment => {
        const sum = treatment.reduce((a, b) => a + b, 0);
        treatmentSums.push(sum);
        treatmentSS += Math.pow(sum, 2) / replications;
    });
    treatmentSS -= cf;

    // 4. حساب مجموع مربعات الخطأ (Error SS)
    const errorSS = totalSS - treatmentSS;

    // 5. حساب درجات الحرية
    const totalDF = n - 1;
    const treatmentDF = treatments - 1;
    const errorDF = totalDF - treatmentDF;

    // 6. حساب متوسط المربعات
    const treatmentMS = treatmentSS / treatmentDF;
    const errorMS = errorSS / errorDF;

    // 7. حساب قيمة F المحسوبة
    const fValue = treatmentMS / errorMS;

    // عرض النتائج
    resultsDiv.innerHTML = `
        <div class="calculation-steps">
            <h3>خطوات الحل:</h3>
            
            <div class="step-box" onclick="toggleStep(this)">
                <h4>1. معامل التصحيح (C.F.)</h4>
                <div class="step-content">
                    <div class="formula">C.F. = (ΣX)² / n</div>
                    <div class="calculation">
                        = (${grandTotal.toFixed(2)})² / ${n}
                        = ${cf.toFixed(4)}
                    </div>
                </div>
            </div>

            <div class="step-box" onclick="toggleStep(this)">
                <h4>2. مجموع المربعات الكلي (Total SS)</h4>
                <div class="step-content">
                    <div class="formula">Total SS = ΣX² - C.F.</div>
                    <div class="calculation">
                        = ${sumOfSquares.toFixed(4)} - ${cf.toFixed(4)}
                        = ${totalSS.toFixed(4)}
                    </div>
                </div>
            </div>

            <div class="step-box" onclick="toggleStep(this)">
                <h4>3. مجموع مربعات المعاملات (Treatment SS)</h4>
                <div class="step-content">
                    <div class="formula">Treatment SS = Σ(Ti²/r) - C.F.</div>
                    <div class="calculation">
                        = (${treatmentSums.map(sum => (Math.pow(sum, 2) / replications).toFixed(4)).join(' + ')}) - ${cf.toFixed(4)}
                        = ${treatmentSS.toFixed(4)}
                    </div>
                </div>
            </div>

            <div class="step-box" onclick="toggleStep(this)">
                <h4>4. مجموع مربعات الخطأ (Error SS)</h4>
                <div class="step-content">
                    <div class="formula">Error SS = Total SS - Treatment SS</div>
                    <div class="calculation">
                        = ${totalSS.toFixed(4)} - ${treatmentSS.toFixed(4)}
                        = ${errorSS.toFixed(4)}
                    </div>
                </div>
            </div>
        </div>

        <div class="anova-box" onclick="toggleAnovaTable(this)">
            <h3>ANOVA</h3>
            <table style="display: none;">
                <thead>
                    <tr>
                        <th>S.V</th>
                        <th>df</th>
                        <th>SS</th>
                        <th>MS</th>
                        <th>F</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Treatments</td>
                        <td>${treatmentDF}</td>
                        <td>${treatmentSS.toFixed(4)}</td>
                        <td>${treatmentMS.toFixed(4)}</td>
                        <td>${fValue.toFixed(4)}</td>
                    </tr>
                    <tr>
                        <td>Error</td>
                        <td>${errorDF}</td>
                        <td>${errorSS.toFixed(4)}</td>
                        <td>${errorMS.toFixed(4)}</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td>${totalDF}</td>
                        <td>${totalSS.toFixed(4)}</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // تمرير إلى النتائج
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// دالة لتبديل عرض خطوات الحل
function toggleStep(element) {
    element.classList.toggle('active');
    const content = element.querySelector('.step-content');
    if (element.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + "px";
    } else {
        content.style.maxHeight = "0";
    }
}

// دالة لتبديل حالة جدول ANOVA
function toggleAnovaTable(element) {
    const table = element.querySelector('table');
    if (table.style.display === 'none' || !table.style.display) {
        table.style.display = 'table';
    } else {
        table.style.display = 'none';
    }
}

// دالة عرض النتائج
function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <table>
            <tr>
                <th>S.V</th>
                <th>df</th>
                <th>SS</th>
                <th>MS</th>
            </tr>
            <tr>
                <td>Treatments</td>
                <td>${results.dfTreatments}</td>
                <td>${results.trss.toFixed(4)}</td>
                <td>${results.msTreatments.toFixed(4)}</td>
            </tr>
            <tr>
                <td>Error</td>
                <td>${results.dfError}</td>
                <td>${results.ess.toFixed(4)}</td>
                <td>${results.msError.toFixed(4)}</td>
            </tr>
            <tr>
                <td>Total</td>
                <td>${results.dfTotal}</td>
                <td>${results.tss.toFixed(4)}</td>
                <td>-</td>
            </tr>
        </table>
        <p>المتوسط العام: ${results.grandMean.toFixed(4)}</p>
        <p>متوسطات المعاملات:</p>
        ${results.treatmentMeans.map((mean, i) => 
            `<p>المعاملة ${i + 1}: ${mean.toFixed(4)}</p>`).join('')}
    `;
}

// تبديل عرض محتوى صناديق المعادلات
function toggleFormula(element) {
    // إضافة أو إزالة الكلاس active
    element.classList.toggle('active');
    
    // الحصول على عنصر المحتوى
    const content = element.querySelector('.formula-content');
    
    // إذا كان العنصر مفتوحاً
    if (element.classList.contains('active')) {
        // تعيين الارتفاع الفعلي للمحتوى
        content.style.maxHeight = content.scrollHeight + "px";
    } else {
        // إغلاق المحتوى
        content.style.maxHeight = "0";
    }
}

// إضافة مستمعي الأحداث
document.getElementById('treatments').addEventListener('change', (e) => {
    treatmentsCount = parseInt(e.target.value);
    createTable();
});

document.getElementById('replications').addEventListener('change', (e) => {
    replicationsCount = parseInt(e.target.value);
    createTable();
});

// إنشاء الجدول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', createTable);

// إضافة مستمع حدث لزر الحساب
document.querySelector('.calculate-btn').addEventListener('click', calculateResults);
