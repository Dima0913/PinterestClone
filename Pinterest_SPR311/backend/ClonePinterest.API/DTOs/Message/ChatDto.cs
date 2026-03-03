using System;

namespace ClonePinterest.API.DTOs.Message
{
    public class ChatDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public string LastMessage { get; set; } = null!;
        public DateTime LastMessageAt { get; set; }
    }
}
