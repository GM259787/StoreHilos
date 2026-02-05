using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models;

public class Order
{
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [Required]
    [StringLength(60)]
    public string OrderNumber { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Shipped, Delivered, Cancelled
    
    [Required]
    public bool IsPaid { get; set; } = false;
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal SubTotal { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal TaxAmount { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal ShippingAmount { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal TotalAmount { get; set; }
    
    [Required]
    [StringLength(200)]
    public string ShippingAddress { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string ShippingCity { get; set; } = string.Empty;
    
    [Required]
    [StringLength(10)]
    public string ShippingPostalCode { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    // Información de pago
    [StringLength(50)]
    public string? PaymentMethod { get; set; } // "PlaceToPay", "MercadoPago", "Transferencia"
    
    [StringLength(100)]
    public string? PaymentReference { get; set; } // Referencia externa del pago
    
    public int? PlaceToPayRequestId { get; set; } // ID de sesión de PlaceToPay
    
    [StringLength(50)]
    public string? PaymentStatus { get; set; } // Estado del pago en el gateway
    
    public DateTime? PaymentDate { get; set; } // Fecha de pago efectivo
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
