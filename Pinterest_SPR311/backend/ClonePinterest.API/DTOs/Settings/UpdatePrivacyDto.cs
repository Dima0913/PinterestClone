namespace ClonePinterest.API.DTOs.Settings;

public class UpdatePrivacyDto
{
    public string? Visibility { get; set; } // Public, Private
    public bool? Searchable { get; set; }
    public bool? ShowEmail { get; set; }
}
