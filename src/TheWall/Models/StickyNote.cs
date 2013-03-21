namespace TheWall.Models
{
    public class StickyNote
    {
        public int Id { get; set; }
        public string Detail { get; set; }
        public Member Creator { get; set; }
    }
}