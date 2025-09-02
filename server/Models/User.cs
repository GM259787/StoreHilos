
using System.ComponentModel.DataAnnotations;

namespace Server.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? PasswordHash { get; set; }
    
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string LastName { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? Phone { get; set; }
    
    [StringLength(200)]
    public string? Address { get; set; }
    
    [StringLength(50)]
    public string? City { get; set; }
    
    [StringLength(10)]
    public string? PostalCode { get; set; }
    
    public bool IsActive { get; set; } = true;
    public bool EmailConfirmed { get; set; } = false;
    
    // Role
    public int RoleId { get; set; } = 1; // Default: Customer
    
    // Google Auth
    [StringLength(100)]
    public string? GoogleId { get; set; }
    
    [StringLength(500)]
    public string? GooglePicture { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Role Role { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<ShoppingCart> ShoppingCarts { get; set; } = new List<ShoppingCart>();
}
