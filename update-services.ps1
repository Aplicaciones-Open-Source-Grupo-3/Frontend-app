# Script para actualizar los servicios del frontend con los nuevos endpoints del backend

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Actualizando Servicios del Frontend" -ForegroundColor Cyan
Write-Host "  Conectando con Backend Spring Boot" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$updates = @(
    @{
        New = "src\app\monitoring\services\vehicle.service.NEW.ts"
        Old = "src\app\monitoring\services\vehicle.service.ts"
        Name = "Vehicle Service"
    },
    @{
        New = "src\app\monitoring\services\operations.service.NEW.ts"
        Old = "src\app\monitoring\services\operations.service.ts"
        Name = "Operations Service"
    },
    @{
        New = "src\app\monitoring\services\incident.service.NEW.ts"
        Old = "src\app\monitoring\services\incident.service.ts"
        Name = "Incident Service"
    },
    @{
        New = "src\app\accounting\services\accounting.service.NEW.ts"
        Old = "src\app\accounting\services\accounting.service.ts"
        Name = "Accounting Service"
    },
    @{
        New = "src\app\clients\services\subscriber.service.NEW.ts"
        Old = "src\app\clients\services\subscriber.service.ts"
        Name = "Subscriber Service"
    },
    @{
        New = "src\app\analytics\services\analytics.service.NEW.ts"
        Old = "src\app\analytics\services\analytics.service.ts"
        Name = "Analytics Service"
    }
)

foreach ($update in $updates) {
    $newFile = $update.New
    $oldFile = $update.Old
    $serviceName = $update.Name

    if (Test-Path $newFile) {
        Write-Host "Actualizando $serviceName..." -ForegroundColor Yellow

        # Crear backup del archivo original
        $backupFile = $oldFile + ".backup"
        if (Test-Path $oldFile) {
            Copy-Item $oldFile $backupFile -Force
            Write-Host "  - Backup creado" -ForegroundColor Gray
        }

        # Reemplazar con el nuevo archivo
        Copy-Item $newFile $oldFile -Force
        Write-Host "  - Archivo actualizado" -ForegroundColor Green

        # Eliminar el archivo .NEW
        Remove-Item $newFile -Force
    } else {
        Write-Host "No se encontro: $newFile" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Actualizacion Completada" -ForegroundColor Green
Write-Host ""

