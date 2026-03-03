using System.ComponentModel.DataAnnotations;

namespace ClonePinterest.API.DTOs.Message
{
    public class SendMessageDto
    {
        [Required(ErrorMessage = "Message content cannot be empty")]
        [MaxLength(2000, ErrorMessage = "Message is too long")]
        public string Content { get; set; } = null!;
    }
}
