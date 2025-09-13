using System.ComponentModel.DataAnnotations;

namespace Server.Models;

public class ShoppingCart
{
    public int Id { get; set; }
    
    public int? UserId { get; set; } // null si es anónimo
    
    [StringLength(100)]
    public string? SessionId { get; set; } // Para usuarios anónimos
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User? User { get; set; }
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
