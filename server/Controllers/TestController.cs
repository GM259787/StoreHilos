using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet("simple")]
    [AllowAnonymous]
    public ActionResult TestSimple()
    {
        return Ok(new { message = "Endpoint funcionando", timestamp = DateTime.Now });
    }

    [HttpGet("orders-test")]
    [AllowAnonymous]
    public ActionResult TestOrdersEndpoint()
    {
        return Ok(new { message = "Orders endpoint accesible", timestamp = DateTime.Now });
    }
}
