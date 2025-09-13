using System.ComponentModel.DataAnnotations;

namespace Server.DTOs;

public class CreateCategoryDto
{
    [Required(ErrorMessage = "El nombre de la categoría es obligatorio")]
    [StringLength(100, ErrorMessage = "El nombre no puede exceder los 100 caracteres")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "El slug es obligatorio")]
    [StringLength(100, ErrorMessage = "El slug no puede exceder los 100 caracteres")]
    [RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "El slug solo puede contener letras minúsculas, números y guiones")]
    public string Slug { get; set; } = string.Empty;
}
