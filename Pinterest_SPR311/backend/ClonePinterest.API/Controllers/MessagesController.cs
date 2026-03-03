using ClonePinterest.API.Data;
using ClonePinterest.API.DTOs.Message;
using ClonePinterest.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ClonePinterest.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MessagesController> _logger;

    public MessagesController(ApplicationDbContext context, ILogger<MessagesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim != null && int.TryParse(claim.Value, out int id))
            return id;
        return null;
    }

    /// <summary>
    /// Get list of chat partners (users with whom current user has exchanged messages)
    /// </summary>
    [HttpGet("chats")]
    public async Task<IActionResult> GetChats()
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized(new { message = "User not authorized" });
        try
        {
            // gather block lists so we can filter out blocked users
            var blockedByMeIds = await _context.UserBlocks
                .Where(b => b.BlockerId == currentUserId)
                .Select(b => b.BlockedId)
                .ToListAsync();
            var blockedMeIds = await _context.UserBlocks
                .Where(b => b.BlockedId == currentUserId)
                .Select(b => b.BlockerId)
                .ToListAsync();

            // gather all messages involving current user
            var msgs = await _context.Messages
                .Where(m => m.SenderId == currentUserId || m.ReceiverId == currentUserId)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            var groups = msgs
                .GroupBy(m => m.SenderId == currentUserId ? m.ReceiverId : m.SenderId)
                .Select(g => new
                {
                    PartnerId = g.Key,
                    Last = g.OrderByDescending(x => x.CreatedAt).First()
                })
                .ToList();

            // filter chat partners who are blocked or have blocked us
            groups = groups
                .Where(g => !blockedByMeIds.Contains(g.PartnerId) && !blockedMeIds.Contains(g.PartnerId))
                .ToList();

            var partnerIds = groups.Select(g => g.PartnerId).ToList();
            var users = await _context.Users
                .Where(u => partnerIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            var chatDtos = groups.Select(g => new ChatDto
            {
                UserId = g.PartnerId,
                Username = users[g.PartnerId].Username,
                AvatarUrl = users[g.PartnerId].AvatarUrl,
                LastMessage = g.Last.Content,
                LastMessageAt = g.Last.CreatedAt
            })
            .OrderByDescending(c => c.LastMessageAt)
            .ToList();

            return Ok(chatDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat list for user {UserId}", currentUserId);
            return StatusCode(500, new { message = "Error getting chat list" });
        }
    }

    /// <summary>
    /// Get conversation between current user and specified user
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetConversation(int userId)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized(new { message = "User not authorized" });

        if (currentUserId == userId)
        {
            return BadRequest(new { message = "Cannot have a conversation with yourself" });
        }

        // if either user has blocked the other, prevent access
        var blocked = await _context.UserBlocks.AnyAsync(b =>
            (b.BlockerId == currentUserId && b.BlockedId == userId) ||
            (b.BlockerId == userId && b.BlockedId == currentUserId));
        if (blocked)
        {
            return Forbid();
        }

        try
        {
            var conversation = await _context.Messages
                .Where(m => (m.SenderId == currentUserId && m.ReceiverId == userId) || (m.SenderId == userId && m.ReceiverId == currentUserId))
                .OrderBy(m => m.CreatedAt)
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .ToListAsync();

            var dto = conversation.Select(m => new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                Content = m.Content,
                CreatedAt = m.CreatedAt,
                SenderUsername = m.Sender.Username,
                ReceiverUsername = m.Receiver.Username,
                SenderAvatarUrl = m.Sender.AvatarUrl,
                ReceiverAvatarUrl = m.Receiver.AvatarUrl
            }).ToList();

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving conversation between {Current} and {Other}", currentUserId, userId);
            return StatusCode(500, new { message = "Error getting conversation" });
        }
    }

    /// <summary>
    /// Send message to specified user
    /// </summary>
    [HttpPost("{userId}")]
    public async Task<IActionResult> SendMessage(int userId, [FromBody] SendMessageDto request)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized(new { message = "User not authorized" });
        if (currentUserId == userId) return BadRequest(new { message = "Cannot send message to yourself" });

        // check block status before allowing send
        var blocked2 = await _context.UserBlocks.AnyAsync(b =>
            (b.BlockerId == currentUserId && b.BlockedId == userId) ||
            (b.BlockerId == userId && b.BlockedId == currentUserId));
        if (blocked2)
        {
            return BadRequest(new { message = "Cannot send message due to block" });
        }

        try
        {
            var other = await _context.Users.FindAsync(userId);
            if (other == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var message = new Message
            {
                SenderId = currentUserId.Value,
                ReceiverId = userId,
                Content = request.Content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // optionally return created item
            var dto = new MessageDto
            {
                Id = message.Id,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                Content = message.Content,
                CreatedAt = message.CreatedAt,
                SenderUsername = (await _context.Users.FindAsync(message.SenderId))?.Username ?? "",
                ReceiverUsername = other.Username,
                SenderAvatarUrl = (await _context.Users.FindAsync(message.SenderId))?.AvatarUrl,
                ReceiverAvatarUrl = other.AvatarUrl
            };

            return CreatedAtAction(nameof(GetConversation), new { userId = userId }, dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message from {Sender} to {Receiver}", currentUserId, userId);
            return StatusCode(500, new { message = "Error sending message" });
        }
    }

    /// <summary>
    /// Block a user. After blocking, you and the blocked user cannot message each other and chats are removed.
    /// </summary>
    [HttpPost("block/{userId}")]
    public async Task<IActionResult> BlockUser(int userId)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized(new { message = "User not authorized" });
        if (currentUserId == userId) return BadRequest(new { message = "Cannot block yourself" });

        var other = await _context.Users.FindAsync(userId);
        if (other == null) return NotFound(new { message = "User not found" });

        // check if already blocked
        var existing = await _context.UserBlocks
            .FirstOrDefaultAsync(b => b.BlockerId == currentUserId && b.BlockedId == userId);
        if (existing != null)
        {
            return BadRequest(new { message = "User already blocked" });
        }

        var block = new UserBlock
        {
            BlockerId = currentUserId.Value,
            BlockedId = userId
        };
        _context.UserBlocks.Add(block);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User blocked" });
    }

    /// <summary>
    /// Unblock a previously blocked user. Only the blocker may call this.
    /// </summary>
    [HttpPost("unblock/{userId}")]
    public async Task<IActionResult> UnblockUser(int userId)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized(new { message = "User not authorized" });
        if (currentUserId == userId) return BadRequest(new { message = "Cannot unblock yourself" });

        var block = await _context.UserBlocks
            .FirstOrDefaultAsync(b => b.BlockerId == currentUserId && b.BlockedId == userId);
        if (block == null)
        {
            return BadRequest(new { message = "User is not blocked" });
        }

        _context.UserBlocks.Remove(block);
        await _context.SaveChangesAsync();
        return Ok(new { message = "User unblocked" });
    }
}
