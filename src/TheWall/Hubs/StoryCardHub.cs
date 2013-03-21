using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TheWall.Models;

namespace TheWall.Hubs
{
    public class StoryCardHub : Hub
    {
        public void Send(string updateType, StoryCard changedStoryCard)
        {
            // call broadcast message
            Clients.All.storyCardUpdate(updateType, changedStoryCard);
        }
    }
}