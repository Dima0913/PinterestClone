using ClonePinterest.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ClonePinterest.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Pin> Pins { get; set; } = null!;
    public DbSet<Board> Boards { get; set; } = null!;
    public DbSet<BoardPin> BoardPins { get; set; } = null!;
    public DbSet<Comment> Comments { get; set; } = null!;
    public DbSet<Like> Likes { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<PinTag> PinTags { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<Report> Reports { get; set; } = null!;
    public DbSet<Follow> Follows { get; set; } = null!;
    public DbSet<View> Views { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<UserBlock> UserBlocks { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Унікальність Email
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Унікальність Username
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        // Унікальність Tag Name
        modelBuilder.Entity<Tag>()
            .HasIndex(t => t.Name)
            .IsUnique();

        // Унікальна пара Like (User + Pin)
        modelBuilder.Entity<Like>()
            .HasIndex(l => new { l.UserId, l.PinId })
            .IsUnique();

        // Унікальна пара BoardPin (Board + Pin)
        modelBuilder.Entity<BoardPin>()
            .HasIndex(bp => new { bp.BoardId, bp.PinId })
            .IsUnique();

        // Унікальна пара PinTag (Pin + Tag)
        modelBuilder.Entity<PinTag>()
            .HasIndex(pt => new { pt.PinId, pt.TagId })
            .IsUnique();

        // Унікальна пара Follow (Follower + Following)
        modelBuilder.Entity<Follow>()
            .HasIndex(f => new { f.FollowerId, f.FollowingId })
            .IsUnique();

        // Indices for messages to speed up queries by sender/receiver
        modelBuilder.Entity<Message>()
            .HasIndex(m => m.SenderId);
        modelBuilder.Entity<Message>()
            .HasIndex(m => m.ReceiverId);
        modelBuilder.Entity<Message>()
            .HasIndex(m => new { m.SenderId, m.ReceiverId });

        // indices for blocking relationships
        modelBuilder.Entity<UserBlock>()
            .HasIndex(b => new { b.BlockerId, b.BlockedId })
            .IsUnique();
    }
}


