namespace ClonePinterest.API.DTOs.User;

public class UserProfileDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string Visibility { get; set; } = "Public";
    public DateTime CreatedAt { get; set; }
    public int PinsCount { get; set; }
    public int BoardsCount { get; set; }
    public int FollowersCount { get; set; }
    public int FollowingCount { get; set; }
    public bool IsFollowing { get; set; }
    public bool IsOwnProfile { get; set; }
    // whether the currently authenticated user has blocked this profile
    public bool IsBlockedByMe { get; set; }
    // whether this profile has blocked the currently authenticated user
    public bool HasBlockedMe { get; set; }
}

