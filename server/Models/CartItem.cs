using System.ComponentModel.DataAnnotations;

namespace Server.Models;

public class CartItem
{
    public int Id { get; set; }
    
    [Required]
    public int CartId { get; set; }
    
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    public int Quantity { get; set; }
    
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ShoppingCart Cart { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
