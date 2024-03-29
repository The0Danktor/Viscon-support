using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Project_C.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly DataContext _context;

        public DepartmentService(DataContext context)
        {
            _context = context;
        }
        public async Task<List<GetDepartmentDto>> AddDepartment(AddDepartmentDto department)
        {
            var newdepartment = new Department
            {
                Id = Guid.NewGuid(),
                Name = department.Name
            };
            _context.Departments.Add(newdepartment);
            await _context.SaveChangesAsync();

            var _ = from d in _context.Departments
                    select new GetDepartmentDto
                    {
                        Id = d.Id,
                        Name = d.Name
                    };
            return await _.ToListAsync();
        }

        public async Task<List<GetDepartmentDto>> GetAllDepartments()
        {
            var query = from d in _context.Departments
                        select new GetDepartmentDto
                        {
                            Id = d.Id,
                            Name = d.Name
                        };
            return await query.ToListAsync();
        }

        public async Task<GetDepartmentDto?> GetDepartmentById(Guid id)
        {
            var department = from d in _context.Departments
                             where d.Id == id
                             select new GetDepartmentDto
                             {
                                 Id = d.Id,
                                 Name = d.Name
                             };
            return await department.FirstOrDefaultAsync();
        }

        public async Task<GetLinkDto?> LinkDepartment(AddLinkDto link)
        {
            var newlink = new DepartmentEmployee
            {
                EmployeeId = link.EmployeeId,
                DepartmentId = link.DepartmentId
            };
            _context.DepartmentEmployees.Add(newlink);
            await _context.SaveChangesAsync();
            var _ = from d in _context.DepartmentEmployees
                    where d.EmployeeId == link.EmployeeId && d.DepartmentId == link.DepartmentId
                    select new GetLinkDto
                    {
                        EmployeeId = d.EmployeeId,
                        DepartmentId = d.DepartmentId
                    };
            return await _.FirstOrDefaultAsync();
        }
    }
}