using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TheWall.Hubs
{
    public class ChatHub : Hub
    {
        public void Send(string name, string message)
        {
            // call broadcast message
            Clients.All.broadcastMessage(name, message);
        }
    }
}