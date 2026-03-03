using System;

namespace ClonePinterest.API.Models
{
    public class UserBlock
    {
        public int Id { get; set; }

        // who initiated the block
        public int BlockerId { get; set; }
        public User Blocker { get; set; }

        // who is being blocked
        public int BlockedId { get; set; }
        public User Blocked { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
