using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Project_C.EF
{
    public class DataContext : DbContext
    {
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<Company> Companies { get; set; } = null!;
        public DbSet<DepartmentEmployee> DepartmentEmployees { get; set; } = null!;
        public DbSet<VisconEmployee> VisconEmployees { get; set; } = null!;
        public DbSet<Machine> Machines { get; set; } = null!;
        public DbSet<CompanyMachine> CompanyMachines { get; set; } = null!;
        public DbSet<Problem> Problems { get; set; } = null!;        
        public DbSet<Solutions> Solutions { get; set; } = null!;
        public DbSet<Ticket> Tickets { get; set; } = null!;
        public DbSet<WorkingOnTicket> WorkingOnTickets { get; set; } = null!;



        public DataContext(DbContextOptions<DataContext> options) : base(options)
        { }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<Customer>()
               .HasOne(c => c.Company)
               .WithMany(c => c.Customers)
               .HasForeignKey(c => c.CompanyId);

            modelBuilder.Entity<Company>()
                .HasOne(c => c.Department)
                .WithMany(c => c.Companies)
                .HasForeignKey(c => c.DepartmentId);

            modelBuilder.Entity<CompanyMachine>()
                .HasOne(c => c.Company)
                .WithMany(c => c.CompanyMachines)
                .HasForeignKey(c => c.CompanyId);

            modelBuilder.Entity<CompanyMachine>()
                .HasOne(c => c.Machine)
                .WithMany(c => c.CompanyMachines)
                .HasForeignKey(c => c.MachineId);

            modelBuilder.Entity<CompanyMachine>()
                .HasOne(c => c.Ticket)
                .WithOne(c => c.CompanyMachine)
                .HasForeignKey<Ticket>(c => c.Tekennummer);

            modelBuilder.Entity<Problem>()
                .HasOne(c => c.Machine)
                .WithMany(c => c.Problems)
                .HasForeignKey(c => c.MachineId);

            modelBuilder.Entity<Solutions>()
                .HasOne(c => c.Problem)
                .WithMany(c => c.Solutions)
                .HasForeignKey(c => c.ProblemId);

            modelBuilder.Entity<Ticket>()
                .HasOne(c => c.Customer)
                .WithMany(c => c.Tickets)
                .HasForeignKey(c => c.CustomerId);

            modelBuilder.Entity<DepartmentEmployee>()
                .HasKey(c => new { c.EmployeeId, c.DepartmentId });
            
            modelBuilder.Entity<DepartmentEmployee>()
                .HasOne(c => c.Department)
                .WithMany(c => c.DepartmentEmployees)
                .HasForeignKey(c => c.DepartmentId);
            
            modelBuilder.Entity<DepartmentEmployee>()
                .HasOne(c => c.Employee)
                .WithMany(c => c.DepartmentEmployees)
                .HasForeignKey(c => c.EmployeeId);

            modelBuilder.Entity<WorkingOnTicket>()
                .HasKey(c => new { c.EmployeeId, c.TicketId });
            
            modelBuilder.Entity<WorkingOnTicket>()
                .HasOne(c => c.Employee)
                .WithMany(c => c.WorkingOnTickets)
                .HasForeignKey(c => c.EmployeeId);
            
            modelBuilder.Entity<WorkingOnTicket>()
                .HasOne(c => c.Ticket)
                .WithMany(c => c.WorkingOnTickets)
                .HasForeignKey(c => c.TicketId);
            
        }

    }

}