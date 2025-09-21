using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileUploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public FileUploadController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet("test-paths")]
    [Authorize(Roles = "Cobrador")]
    public IActionResult TestPaths()
    {
        var webRootPath = _environment.ContentRootPath; // Apunta al directorio base (httpdocs)
        var uploadsFolder = Path.Combine(webRootPath, "uploads", "products");
        
        return Ok(new { 
            WebRootPath = _environment.WebRootPath,
            ContentRootPath = _environment.ContentRootPath,
            CalculatedWebRootPath = webRootPath,
            UploadsFolder = uploadsFolder,
            UploadsFolderExists = Directory.Exists(uploadsFolder),
            CanWrite = CanWriteToDirectory(uploadsFolder)
        });
    }

    [HttpPost("upload-image")]
    [Authorize(Roles = "Cobrador")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No se ha seleccionado ningún archivo" });
            }

            // Validar tipo de archivo
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new { message = "Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)" });
            }

            // Validar tamaño del archivo (máximo 5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { message = "El archivo es demasiado grande. Máximo 5MB permitido" });
            }

            // Crear directorio si no existe
            var webRootPath = _environment.ContentRootPath; // Apunta al directorio base (httpdocs)
            var uploadsFolder = Path.Combine(webRootPath, "uploads", "products");
            
            // Asegurar que el directorio existe
            if (!Directory.Exists(uploadsFolder))
            {
                try
                {
                    Directory.CreateDirectory(uploadsFolder);
                }
                catch (Exception dirEx)
                {
                    return StatusCode(500, new { message = $"Error al crear directorio: {dirEx.Message}" });
                }
            }
            
            // Verificar que el directorio se creó correctamente
            if (!Directory.Exists(uploadsFolder))
            {
                return StatusCode(500, new { message = $"No se pudo crear el directorio de uploads en: {uploadsFolder}" });
            }

            // Generar nombre único para el archivo
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Guardar el archivo
            try
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
            }
            catch (Exception saveEx)
            {
                return StatusCode(500, new { message = $"Error al guardar archivo: {saveEx.Message}" });
            }
            
            // Verificar que el archivo se guardó correctamente
            if (!System.IO.File.Exists(filePath))
            {
                return StatusCode(500, new { message = $"No se pudo guardar el archivo en: {filePath}" });
            }

            // Retornar la URL relativa del archivo
            //var fileUrl = $"/uploads/products/{fileName}";
            var fileUrl = filePath;
            return Ok(new { 
                message = "Archivo subido exitosamente",
                fileUrl = fileUrl,
                fileName = fileName
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error al subir el archivo: {ex.Message}" });
        }
    }

    private bool CanWriteToDirectory(string path)
    {
        try
        {
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            
            var testFile = Path.Combine(path, $"test_{Guid.NewGuid()}.tmp");
            System.IO.File.WriteAllText(testFile, "test");
            System.IO.File.Delete(testFile);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
