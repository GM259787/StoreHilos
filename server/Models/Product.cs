using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models;

public class Product
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    [StringLength(500)]
    public string? ImageUrl { get; set; }
    
    [Required]
    [Range(0, int.MaxValue)]
    public int Stock { get; set; }
    
    [Required]
    [Range(0, int.MaxValue)]
    public int ReservedStock { get; set; } = 0;
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }
    
    [Required]
    public int CategoryId { get; set; }
    
    // Navigation property
    public Category Category { get; set; } = null!;
    
    // Propiedad calculada para stock disponible
    [NotMapped]
    public int AvailableStock => Stock - ReservedStock;
}
