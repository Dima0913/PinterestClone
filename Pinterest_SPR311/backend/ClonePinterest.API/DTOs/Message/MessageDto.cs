using System;

namespace ClonePinterest.API.DTOs.Message
{
    public class MessageDto
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public string SenderUsername { get; set; } = null!;
        public string ReceiverUsername { get; set; } = null!;
        public string? SenderAvatarUrl { get; set; }
        public string? ReceiverAvatarUrl { get; set; }
    }
}
