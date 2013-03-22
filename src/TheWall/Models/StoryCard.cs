namespace TheWall.Models
{
    using System.Collections.Generic;

    public class StoryCard
    {
        public int Id { get; set; }
        public string AcceptanceCriteria { get; set; }
        public int StoryPoints { get; set; }
        public string Title { get; set; }
        public bool IsBlocked { get; set; }
        public int ColumnId { get; set; }
        public string Notes { get; set; }
        public ICollection<StickyNote> StickyNotes { get; protected set; }
        public ICollection<Member> Collaborators { get; protected set; } 

        public StoryCard()
        {
            this.StickyNotes = new List<StickyNote>();
            this.Collaborators = new List<Member>();
        }
    }
}