using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Project_C.Dtos
{
    public class AddTicketDto
    {
        public Guid ProblemId { get; set; }
        public string Tekennummer { get; set; } = null!;
        public string Note { get; set; } = null!;
    }
}