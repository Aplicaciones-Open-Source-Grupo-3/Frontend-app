const fs = require('fs');
const path = require('path');

// Leer el archivo HTML del registro
const htmlPath = path.join(__dirname, 'src/app/iam/pages/register/register.page.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Buscar la línea del error-alert y agregar el success-alert después
const errorAlertEnd = '</div>';
const searchPattern = `        <div class="error-alert" *ngIf="errorMessage">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>`;

const successAlert = `
        <div class="success-alert" *ngIf="successMessage">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{{ successMessage }}</span>
        </div>`;

// Reemplazar
const replacement = searchPattern + successAlert;
htmlContent = htmlContent.replace(searchPattern, replacement);

// Guardar el archivo
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('✅ Mensaje de éxito agregado exitosamente al formulario de registro!');

