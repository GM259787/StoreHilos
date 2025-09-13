using System.ComponentModel.DataAnnotations;

namespace Server.DTOs;

public class UpdateShippingInfoDto
{
    [Required]
    [StringLength(20)]
    public string ShippingPhone { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string ShippingAddress { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string ShippingCity { get; set; } = string.Empty;
    
    [Required]
    [StringLength(10)]
    public string ShippingPostalCode { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? ShippingInstructions { get; set; }
}
