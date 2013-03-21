// --------------------------------------------------------------------------------------------------------------------
// <copyright file="StoryCardHub.cs" company="nib healthfunds ltd.">
//   Copyright 2013
// </copyright>
// <summary>
//   Defines the StoryCardHub type.
// </summary>
// --------------------------------------------------------------------------------------------------------------------

namespace TheWall.Hubs
{
    using Microsoft.AspNet.SignalR;

    using TheWall.Models;

    /// <summary>
    /// The story card hub.
    /// </summary>
    public class StoryCardHub : Hub
    {
        /// <summary>
        /// The send.
        /// </summary>
        /// <param name="updateType">
        /// The update type.
        /// </param>
        /// <param name="changedStoryCard">
        /// The changed story card.
        /// </param>
        public void Send(string updateType, StoryCard changedStoryCard)
        {
            // call broadcast message
            Clients.All.storyCardUpdate(updateType, changedStoryCard);
        }
    }
}