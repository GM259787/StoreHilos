using System.ComponentModel.DataAnnotations;

namespace Server.Models;

public class Category
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string Slug { get; set; } = string.Empty;
    
    // Navigation property
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
