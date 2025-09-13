namespace Server.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int Stock { get; set; }
    public int ReservedStock { get; set; }
    public int AvailableStock { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    
    // Campos para descuento por cantidad
    public bool HasQuantityDiscount { get; set; }
    public int? MinQuantityForDiscount { get; set; }
    public decimal? DiscountedPrice { get; set; }
    public DateTime? DiscountStartDate { get; set; }
    public DateTime? DiscountEndDate { get; set; }
    public bool IsDiscountActive { get; set; }
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int Stock { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
}

public class UpdateProductDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int? Stock { get; set; }
    public decimal? Price { get; set; }
    public int? CategoryId { get; set; }
    
    // Campos para descuento por cantidad
    public bool? HasQuantityDiscount { get; set; }
    public int? MinQuantityForDiscount { get; set; }
    public decimal? DiscountedPrice { get; set; }
    public DateTime? DiscountStartDate { get; set; }
    public DateTime? DiscountEndDate { get; set; }
}
