// --------------------------------------------------------------------------------------------------------------------
// <copyright file="Column.cs" company="">
//   Copyright 2013
// </copyright>
// <summary>
//   Defines the Column type.
// </summary>
// --------------------------------------------------------------------------------------------------------------------

namespace TheWall.Models
{
    /// <summary>
    /// The column.
    /// </summary>
    public class Column
    {
        /// <summary>
        /// Gets or sets the id.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the title.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Gets or sets the order.
        /// </summary>
        public int Order { get; set; }
    }
}