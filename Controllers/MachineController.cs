using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Project_C.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]

    public class MachineController : ControllerBase
    {
        private readonly IMachineService _machineService;
        private readonly IAuthService _authService;

        public MachineController(IMachineService machineService, IAuthService authService)
        {
            _machineService = machineService;
            _authService = authService;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<List<GetMachineDto>>> Get()
        {
           return Ok(await _machineService.GetAllMachines());
        }

        [HttpGet("Current/{id}")]
        public async Task<ActionResult<List<GetMachineDto>>> GetFromCurrentCompany(string id)
        {
            var user = await _authService.Get(Guid.Parse(id));

            if (user == null)
                return BadRequest();

            if (user.CompanyId.HasValue)
                return Ok(await _machineService.GetByCompanyId(user.CompanyId.Value));
            return Ok(await _machineService.GetAllMachines());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GetMachineDto>> Get(Guid id)
        {
            var result = await _machineService.GetMachineById(id);

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpPost] [Authorize (Roles = "Viscon_admin, Viscon_employee")]
        public async Task<ActionResult<List<GetMachineDto>>> Post(AddMachineDto machine)
        {
            return Ok(await _machineService.AddMachine(machine));
        }

        
    }
}